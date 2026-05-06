import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import * as supabaseTasks from '@/lib/supabase/tasks';
import type { TaskInput } from '@/lib/supabase/tasks';

async function getServerClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await supabaseTasks.getTasks(user.id);
    return NextResponse.json({ items: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const taskData: TaskInput = body;

    const task = await supabaseTasks.createTask(user.id, taskData);
    return NextResponse.json({ ok: true, item: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body?.id as string | undefined;
    const taskData = body?.taskData as Partial<TaskInput> | undefined;

    if (!id || !taskData) {
      return NextResponse.json({ ok: false, error: 'id and taskData are required' }, { status: 400 });
    }

    const updated = await supabaseTasks.updateTask(user.id, id, taskData);
    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = body?.id as string | undefined;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
    }

    const deleted = await supabaseTasks.deleteTask(user.id, id);
    return NextResponse.json({ ok: true, item: deleted });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
