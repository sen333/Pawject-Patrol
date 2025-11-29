import { NextResponse } from 'next/server';
import { getUser, createClient } from '@/utils/supabase/server';
import { createVolunteerCall } from '@/actions/volunteer/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || '');
    const call_details = String(body.call_details || '');
    const call_location = String(body.call_location || '');
    const start_time = String(body.call_starttime || '');
    const end_time = String(body.call_endtime || '');
    const capacity = parseInt(String(body.capacity || '0'), 10) || 0;
    const status = String(body.status || 'Pending');

    if (start_time) {
      const startDate = new Date(start_time);
      if (isNaN(startDate.getTime())) return NextResponse.json({ error: 'Invalid start time' }, { status: 400 });
      if (startDate.getTime() < Date.now()) return NextResponse.json({ error: 'Start time must not be before the current date and time' }, { status: 400 });
      if (end_time) {
        const endDate = new Date(end_time);
        if (isNaN(endDate.getTime())) return NextResponse.json({ error: 'Invalid end time' }, { status: 400 });
        if (endDate.getTime() < startDate.getTime()) return NextResponse.json({ error: 'End time must not be before start time' }, { status: 400 });
      }
    }

    const user = await getUser();
    const adminId = user?.id;
    if (!adminId) return NextResponse.json({ error: 'You must be signed in as an admin to create volunteer calls.' }, { status: 401 });

    try {
      await createVolunteerCall({ call_title: title, call_details, call_location, call_starttime: start_time, call_endtime: end_time, capacity, call_status: status }, adminId);
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (/violates foreign key constraint .*volunteer_call_admin_id_fkey/i.test(msg) || err?.code == '23503') {
        const hintSql = `-- If you intend this auth user to be an admin, insert into public.admin:\nINSERT INTO public.admin (auth_id, added_at) VALUES ('${adminId}', now());`;
        return NextResponse.json({ error: `Insert failed: admin auth id ${adminId} is not present in table public.admin. Quick fix (run in Supabase SQL editor):\n${hintSql}` }, { status: 400 });
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
