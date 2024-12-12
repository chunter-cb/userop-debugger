'use client';

import {
  GITHUB_LINK,
  CDP_LINK,
  TENDERLY_LINK,
  TWITTER_LINK,
} from 'src/links';
import ArrowSvg from 'src/svg/ArrowSvg';

const docLinks = [
  { href: CDP_LINK, title: 'CDP' },
  { href: TENDERLY_LINK, title: 'Tenderly' },
  { href: GITHUB_LINK, title: 'Github' },
  { href: TWITTER_LINK, title: 'X' },
];

export default function Footer() {
  return (
    <section className="mt-auto mb-2 flex w-full flex-col flex-col-reverse justify-between gap-2 md:mt-8 md:mb-6 md:flex-row">
      <aside className="flex items-center pt-2 md:pt-0">
        <h3 className="mr-2 mb-2 text-m md:mb-0">
          Built with love by{' '}
          <a
            href="https://www.base.org/name/chunter"
            target="_blank"
            rel="noreferrer"
            title="chunter.base.eth"
            className="font-semibold hover:text-indigo-600"
          >
            chunter.base.eth
          </a>
        </h3>
      </aside>
      <ul className="mt-4 flex max-w-full flex-col flex-wrap justify-center gap-3 md:mt-0 md:flex-row md:justify-start md:gap-6">
        {docLinks.map(({ href, title }) => (
          <li className="flex" key={href}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              title={title}
              className="flex items-center gap-1"
            >
              <p>{title}</p>
              <ArrowSvg />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
