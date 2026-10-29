create schema if not exists pixbet_private;
revoke all on schema pixbet_private from public;
grant usage on schema pixbet_private to authenticated;
create table public.pixbet_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 balance_cents bigint not null default 0 check(balance_cents between 0 and 100000000),
 updated_at timestamptz not null default now()
);
create table public.pixbet_wallet_transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 kind text not null check(kind in ('topup','withdraw')),
 amount_cents bigint not null check(amount_cents between 1 and 1000000),
 balance_after_cents bigint not null check(balance_after_cents between 0 and 100000000),
 currency text not null default 'TRY' check(currency='TRY'),
 simulated boolean not null default true check(simulated),
 created_at timestamptz not null default now(),
 unique(user_id,request_id)
);
create index pixbet_wallet_history on public.pixbet_wallet_transactions(user_id,created_at desc);
alter table public.pixbet_wallets enable row level security;
alter table public.pixbet_wallet_transactions enable row level security;
revoke all on public.pixbet_wallets,public.pixbet_wallet_transactions from anon,authenticated;
grant select on public.pixbet_wallets,public.pixbet_wallet_transactions to authenticated;
create policy wallet_owner_read on public.pixbet_wallets for select to authenticated using((select auth.uid())=user_id);
create policy wallet_history_owner_read on public.pixbet_wallet_transactions for select to authenticated using((select auth.uid())=user_id);
create function pixbet_private.wallet_change(p_amount bigint,p_kind text,p_request uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_balance bigint; v_previous public.pixbet_wallet_transactions%rowtype;
begin
 if v_user is null then raise exception 'authentication_required'; end if;
 if p_amount is null or p_amount<1 or p_amount>1000000 or p_kind is null or p_kind not in ('topup','withdraw') or p_request is null then raise exception 'invalid_amount'; end if;
 insert into public.pixbet_wallets(user_id) values(v_user) on conflict(user_id) do nothing;
 select balance_cents into v_balance from public.pixbet_wallets where user_id=v_user for update;
 select * into v_previous from public.pixbet_wallet_transactions where user_id=v_user and request_id=p_request;
 if found then
  if v_previous.kind<>p_kind or v_previous.amount_cents<>p_amount then raise exception 'idempotency_conflict'; end if;
  return jsonb_build_object('balanceCents',v_balance,'currency','TRY','simulated',true,'duplicate',true);
 end if;
 if p_kind='withdraw' and v_balance<p_amount then raise exception 'insufficient_balance'; end if;
 v_balance:=v_balance+case when p_kind='topup' then p_amount else -p_amount end;
 if v_balance>100000000 then raise exception 'balance_limit'; end if;
 update public.pixbet_wallets set balance_cents=v_balance,updated_at=now() where user_id=v_user;
 insert into public.pixbet_wallet_transactions(user_id,request_id,kind,amount_cents,balance_after_cents) values(v_user,p_request,p_kind,p_amount,v_balance);
 return jsonb_build_object('balanceCents',v_balance,'currency','TRY','simulated',true,'duplicate',false);
end;$$;
revoke all on function pixbet_private.wallet_change(bigint,text,uuid) from public,anon;
grant execute on function pixbet_private.wallet_change(bigint,text,uuid) to authenticated;
create function public.pixbet_wallet_change(amount_cents bigint,kind text,request_id uuid)
returns jsonb language sql security invoker set search_path='' as $$select pixbet_private.wallet_change(amount_cents,kind,request_id);$$;
revoke all on function public.pixbet_wallet_change(bigint,text,uuid) from public,anon;
grant execute on function public.pixbet_wallet_change(bigint,text,uuid) to authenticated;
