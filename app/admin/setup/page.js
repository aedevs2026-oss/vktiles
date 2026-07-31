import Link from "next/link";



export default function AdminSetupPage() {

  return (

    <div className="min-h-screen bg-background text-navy flex items-center justify-center p-6">

      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8">

        <h1 className="font-display text-2xl mb-4">Supabase Setup Required</h1>

        <ol className="list-decimal list-inside space-y-3 text-sm text-gray">

          <li>

            Create a project at{" "}

            <a href="https://supabase.com" className="text-sky underline" target="_blank" rel="noreferrer">

              supabase.com

            </a>

          </li>

          <li>Run SQL files: schema.sql, storage.sql, site-content.sql</li>

          <li>Copy .env.example to .env.local and add your keys</li>

          <li>Create an admin user in Supabase Auth</li>

          <li>Run npm run import-supabase and npm run import-site-content</li>

        </ol>

        <Link href="/admin/login" className="inline-block mt-6 text-sky text-sm hover:underline">

          Go to login →

        </Link>

      </div>

    </div>

  );

}


