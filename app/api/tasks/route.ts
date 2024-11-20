import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Type definition for Task
interface Task {
  id?: string;
  text: string;
  completed: boolean;
  order?: number;
}

// Replace entire tasks collection
export async function POST(request: Request) {
  try {
    // Parse the entire tasks array from the request
    const { tasks }: { tasks: Task[] } = await request.json();
    
    // Validate input
    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Invalid tasks data' }, 
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('journal')
    const tasksCollection = db.collection('tasks');

    try {
      await tasksCollection.deleteMany({});
      if (tasks.length > 0) {
        await tasksCollection.insertMany(tasks);
      }

      return NextResponse.json(
        { 
          message: 'Tasks updated successfully', 
          count: tasks.length 
        }, 
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating tasks:', error);
      return NextResponse.json(
        { error: 'Failed to update tasks', details: error instanceof Error ? error.message : error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update tasks', details: error instanceof Error ? error.message : error }, 
      { status: 500 }
    );
  }
}

// Fetch all tasks
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('journal');
    
    // Fetch tasks sorted by order
    const tasks = await db.collection('tasks')
      .find({})
      .sort({ order: 1 })
      .toArray();
    
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}