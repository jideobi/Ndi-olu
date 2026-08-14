const footerLinks = {
  Platform: [
    { label: "Find a worker", href: "/find-workers" },
    { label: "Post a job", href: "/post-job" },
    { label: "How Ndi-Olu works", href: "/#how-it-works" },
  ],
  Professionals: [
    { label: "Join as a worker", href: "/signup?role=worker" },
    { label: "Worker guidelines", href: "/worker-guidelines" },
    { label: "Safety and verification", href: "/safety" },
  ],
  Support: [
    { label: "Help centre", href: "/help" },
    { label: "Contact support", href: "/contact" },
    { label: "Report a concern", href: "/report" },
  ],
};

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#092E23] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.45fr_2fr] lg:gap-20">
          <div>
            <a
              href="/"
              className="text-3xl font-extrabold tracking-[-0.06em] text-white"
            >
              Ndi<span className="text-[#F08A58]">-</span>Olu
            </a>

            <p className="mt-5 max-w-sm text-base leading-7 text-emerald-100/80">
              A trusted marketplace that helps people across Enugu State find
              skilled professionals and get important work done with confidence.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#F08A58] text-lg">
                ⌖
              </span>

              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-emerald-200">
                  BUILT FOR
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  Enugu State, Nigeria
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-9 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h2 className="text-sm font-bold text-white">{title}</h2>

                <ul className="mt-5 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-emerald-100/70 transition hover:text-[#F7B38C]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-7 text-sm text-emerald-100/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} Ndi-Olu. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a href="/privacy" className="transition hover:text-white">
              Privacy policy
            </a>
            <a href="/terms" className="transition hover:text-white">
              Terms of service
            </a>
            <a href="/accessibility" className="transition hover:text-white">
              Accessibility
            </a>
          </div>

          <a
            href="#top"
            className="flex w-fit items-center gap-2 font-semibold text-[#F7B38C] transition hover:text-white"
          >
            Back to top
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;