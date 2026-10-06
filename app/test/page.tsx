import { sql } from '@/lib/utils';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql.query('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }

  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}