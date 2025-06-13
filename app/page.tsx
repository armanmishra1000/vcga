import Image from 'next/image';

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          className="dark:invert"
          priority
        />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left">
          <li className="mb-2">
            Get started by editing{' '}
            <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-black px-4 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:h-12 sm:px-5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src="/vercel.svg" alt="Vercel" width={20} height={20} className="dark:invert" />
            Deploy now
          </a>

          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            className="h-10 rounded-full border border-gray-300 px-4 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 sm:h-12 sm:px-5"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6 text-sm">
        <FooterLink href="https://nextjs.org/learn">Learn</FooterLink>
        <FooterLink href="https://vercel.com/templates?framework=next.js">Examples</FooterLink>
        <FooterLink href="https://nextjs.org">Go to nextjs.org →</FooterLink>
      </footer>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
