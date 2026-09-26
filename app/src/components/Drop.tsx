"use client";

import dynamic from "next/dynamic";
import CosignLetter from "./CosignLetter";

const SignalLab = dynamic(() => import("./SignalLab"), {
  ssr: false,
  loading: () => (
    <div className="border border-[var(--line)] p-8 text-[13px] text-[var(--ink-3)]">
      Loading market model…
    </div>
  ),
});

const TABLE_ROWS = [
  {
    row: "Cost to send",
    free: "Zero",
    named: "Your reputation, a little",
    tag: null as string | null,
  },
  {
    row: "Cost of being wrong",
    free: "Zero",
    named: "Your reputation, a lot",
    tag: "DOWNSIDE",
  },
  {
    row: "Supply",
    free: "Unlimited",
    named: "Rationed",
    tag: "SCARCE",
  },
  {
    row: "What it tells a stranger",
    free: "Somebody was active",
    named: "Somebody staked their name",
    tag: null,
  },
  {
    row: "Instagram",
    free: "A like, a follow",
    named: "A print on a gallery wall",
    tag: null,
  },
  {
    row: "Careers",
    free: "A connection, an endorsement",
    named: "A cosign",
    tag: "NAMED",
  },
] as const;

const SOURCES = [
  {
    date: "Jan 2025",
    href: "https://www.digitalcameraworld.com/tech/social-media/instagram-is-dead-for-photographers-and-tiktoks-future-is-uncertain-so-people-are-flocking-back-to-an-old-faithful-platform",
    label: "Digital Camera World — Flickr return / photographer sentiment",
  },
  {
    date: "Sep 2025",
    href: "https://photokwame.substack.com/p/why-i-quit-instagram",
    label: "Kwame Johnson — Why I Quit Instagram",
  },
  {
    date: "May 2025",
    href: "https://fstoppers.com/social-media/instagram-wasnt-problem-our-obsession-was-701177",
    label: "Justin Tedford / Fstoppers — metrics mentality",
  },
  {
    date: "2025",
    href: "https://www.outlawphotography.co.uk/blog/why-instagram-is-failing-photographers-in-2025",
    label: "Outlaw Photography — Why Instagram Is Failing Photographers in 2025",
  },
  {
    date: "Mar 2018",
    href: "https://petapixel.com/2018/03/21/this-photographer-deleted-his-social-media-with-1-5-million-followers/",
    label: "PetaPixel — Dave Morrow deletes social accounts (~1.5M followers)",
  },
  {
    date: "—",
    href: "https://www.flakphoto.news/p/wheres-your-community",
    label: "Andy Adams / FlakPhoto — Where’s your community?",
  },
  {
    date: "—",
    href: "https://gilesthurston.substack.com/p/lets-talk-about-social-media",
    label: "Giles Thurston — social media as a photographer (Substack/Foto)",
  },
  {
    date: "2009",
    href: "https://www.cio.com/article/278840/internet-linkedin-clamps-down-on-super-connected-users.html",
    label: "CIO — LinkedIn 500+ display / connection counting",
  },
  {
    date: "Sep 2012",
    href: "https://techcrunch.com/2012/09/24/linkedin-debuts-endorsements-as-a-lightweight-way-to-recommend-a-professional-contacts-skills/",
    label: "TechCrunch — LinkedIn Endorsements debut",
  },
  {
    date: "Dec 2017",
    href: "https://www.buzzfeednews.com/article/ryanmac/why-are-these-posts-taking-over-your-linkedin-feed-because",
    label: "BuzzFeed News — Broetry on LinkedIn",
  },
  {
    date: "Mar 2021",
    href: "https://techcrunch.com/2021/03/30/linkedin-adds-creator-mode-video-profiles-and-in-partnership-with-microsoft-new-career-training-tools/",
    label: "TechCrunch — Creator Mode",
  },
  {
    date: "Oct 2024",
    href: "https://www.socialmediatoday.com/news/linkedins-removing-top-voice-badges-collaborative-articles/728247/",
    label: "Social Media Today — Community Top Voice badge retired",
  },
  {
    date: "—",
    href: "https://www.linkedin.com/pulse/futility-linkedin-endorsements-sudarsan-santhanam",
    label: "Sudarsan Santhanam — The (F)utility of LinkedIn endorsements",
  },
  {
    date: "2012",
    href: "https://www.forbes.com/sites/susanadams/2012/12/04/everything-you-need-to-know-about-linkedin-endorsements/",
    label: "Forbes / Susan Adams — LinkedIn endorsements mechanics",
  },
  {
    date: "—",
    href: "https://www.mcbrayerfirm.com/blogs-Employment-Law-Blog,do-linkedin-endorsements-create-a-chink-in-professionalism",
    label: "McBrayer — LinkedIn endorsements and reciprocal dilemma",
  },
  {
    date: "—",
    href: "https://www.ere.net/articles/linkedin-endorsements-good-idea-but-we-need-a-lot-more-than-it-offers",
    label: "ERE — LinkedIn endorsements: scarcity / stakes critique",
  },
  {
    date: "2025",
    href: "https://www.linkedin.com/posts/therealestrecruiter_i-dont-know-who-needs-to-hear-this-but-activity-7343288226280820736-0f3t",
    label: "Recruiter thread — hiring managers and endorsement counts",
  },
  {
    date: "Sep 2026",
    href: "https://www.a16z.news/p/how-silicon-valley-knows-its-people",
    label: "a16z.news — How Silicon Valley Knows Its People",
  },
  {
    date: "—",
    href: "https://a16zjobs.substack.com/p/introducing-cosign-a-new-space-to",
    label: "a16z Jobs — Introducing Cosign",
  },
] as const;


export default function Drop() {
  return (
    <div className="dot-grid relative text-[var(--ink)]">
      {/* Masthead */}
      <header className="mx-auto flex max-w-6xl items-start justify-between gap-6 px-5 pt-10 pb-6 sm:px-6 sm:pt-14">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.04em] text-[var(--ink-2)]">
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: "var(--gold)" }}
              aria-hidden
            />
            When signals get cheap
          </div>
        </div>
        <div className="font-mono text-[11px] tracking-[0.06em] text-[var(--ink-3)]">
          25 SEP 2026
        </div>
      </header>

      {/* HOOK */}
      <section
        id="hook"
        className="cs-fade-up mx-auto max-w-6xl px-5 pt-10 sm:px-6 sm:pt-14"
      >
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="order-2 flex flex-col justify-center lg:order-1 lg:min-h-[20rem] lg:pr-4">
            <p className="flex items-center gap-2 text-[12px] font-medium tracking-[0.08em] text-[var(--ink-3)]">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--gold)" }}
                aria-hidden
              />
              Instagram ran it first
            </p>
            <h1 className="mt-4 text-[2.4rem] font-medium leading-[1.08] tracking-tightish text-[var(--ink)] sm:text-[3.1rem]">
              Cheap Signal
            </h1>
            <p className="mt-6 max-w-md text-base leading-[1.65] text-[var(--ink-2)]">
              When signals get cheap, the people who cared leave. Instagram ran
              the experiment on photographers. Cosign is the control.
            </p>
            <p className="mt-8 font-mono text-[11px] tracking-[0.08em] text-[var(--ink-3)]">
              Prithvi Datla
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="w-full max-w-md lg:max-w-none">
              <CosignLetter />
              <p className="mt-3 w-full text-left text-[13px] leading-snug text-[var(--ink-3)]">
                A signature cost an afternoon, a sheet of letterhead, and a name
                at the bottom.
              </p>
            </div>
          </div>
        </div>


        <div className="mt-14 max-w-3xl space-y-5 text-base leading-[1.65] text-[var(--ink-2)] sm:mt-16">
          <p>
            Cheap signals fail when the act becomes reciprocal, zero-stakes, and
            unlimited — not because a platform made belief{" "}
            <em className="not-italic text-[var(--ink)]">easier</em> to find.
            LinkedIn skill endorsements were public name-backed belief. They
            went to theater. That gap decides whether Cosign survives.
          </p>
          <p>
            Scarcity is{" "}
            <em className="not-italic text-[var(--ink)]">
              expensive commitment
            </em>{" "}
            — hire, check, IRL invite — versus{" "}
            <em className="not-italic text-[var(--ink)]">cheap attestation</em>{" "}
            — a like, an endorsement tap, a drive-by repost.
          </p>
        </div>
      </section>

      {/* MECHANISM */}
      <section
        id="mechanism"
        className="cs-fade-up mx-auto mt-20 max-w-6xl px-5 sm:mt-24 sm:px-6"
      >
        <div className="max-w-3xl">
          <h2 className="text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
            What costs something, and what does not.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              Binding signals cost something — time, skill, money, a seat, a
              name with downside. Technique critique. A paid subscription. A
              commission. A warm intro. A hire. An IRL invite. Those do not
              scale like a heart tap or a skill endorsement.
            </p>
            <p>
              A public cosign is valuable only while it stays costly. A drive-by
              tweet-repost is a cheap cosign: public, attributable, low
              downside. Signing a check, hiring someone, or putting a scarce
              seat on the line is an expensive one. Builders and capital
              allocators need the expensive kind.
            </p>
            <p>
              Belief-cost order, high to low: IRL invite / hire / write a check
              → private would-work-with → public attributed cosign with a
              specific why → list inclusion → LinkedIn endorsement / drive-by
              repost → like / view. Public cosign is{" "}
              <em className="not-italic text-[var(--ink)]">not</em> the scarcest
              signal.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <div
            className="p-5"
            style={{
              background: "var(--vanity-fill)",
              border: "1px solid var(--vanity-line)",
              borderRadius: "var(--radius)",
            }}
          >
            <div
              className="text-[12px] font-medium tracking-[0.04em]"
              style={{ color: "var(--vanity)" }}
            >
              Cheap attestation
            </div>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--ink-2)]">
              <li>Like / heart / Reel view</li>
              <li>Follower count as legitimacy</li>
              <li>LinkedIn skill endorsement</li>
              <li>Drive-by tweet / repost “cosign”</li>
              <li>Engagement-bait comments</li>
            </ul>
          </div>
          <div
            className="p-5"
            style={{
              background: "var(--belief-fill)",
              border: "1px solid var(--belief-line)",
              borderRadius: "var(--radius)",
            }}
          >
            <div
              className="text-[12px] font-medium tracking-[0.04em]"
              style={{ color: "var(--belief)" }}
            >
              Costly commitment
            </div>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-[var(--ink-2)]">
              <li>Hire / write a check / seed</li>
              <li>Scarce IRL invite</li>
              <li>Private “would work with”</li>
              <li>Public cosign with specific why</li>
              <li>Warm intro / named commission</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section
        id="proof"
        className="cs-fade-up mx-auto mt-20 max-w-6xl px-5 sm:mt-24 sm:px-6"
      >
        <div className="max-w-3xl">
          <h2 className="text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
            A photographer, twice.
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <article className="cs-exhibit" data-era="craft">
            <div className="cs-exhibit-year">2012</div>
            <div
              className="mt-2 text-[12px] font-medium tracking-[0.06em]"
              style={{ color: "var(--gold)" }}
            >
              Craft
            </div>
            <p className="cs-exhibit-metric">Reach still tracked care</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              A like was expensive to earn. People who understood the craft —
              landscape shooters recognizing landscape shooters — sent it. Reach
              still tracked care.
            </p>
            <a
              className="cs-exhibit-source"
              href="https://www.digitalcameraworld.com/tech/social-media/instagram-is-dead-for-photographers-and-tiktoks-future-is-uncertain-so-people-are-flocking-back-to-an-old-faithful-platform"
              target="_blank"
              rel="noreferrer"
            >
              Source ↗
            </a>
          </article>
          <article className="cs-exhibit" data-era="performance">
            <div className="cs-exhibit-year">2022</div>
            <div className="mt-2 text-[12px] font-medium tracking-[0.06em] text-[var(--ink-3)]">
              Performance
            </div>
            <p className="cs-exhibit-metric">Following intact · likes gone</p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              Algorithmic ranking and Reels priority. Trade press (Fstoppers,
              Digital Camera World) describes likes collapsing while followings
              stay intact. Landscape photographer{" "}
              <em className="not-italic text-[var(--ink)]">Dave Morrow</em>{" "}
              deleted social accounts totaling about 1.5 million followers
              rather than keep performing.
            </p>
            <a
              className="cs-exhibit-source"
              href="https://fstoppers.com/social-media/instagram-wasnt-problem-our-obsession-was-701177"
              target="_blank"
              rel="noreferrer"
            >
              Source ↗
            </a>
          </article>
        </div>

        <div className="max-w-3xl">
          <h3 className="mt-12 text-[1.25rem] font-medium tracking-tightish text-[var(--ink)]">
            Photographers as the canary — not vanity-only.
          </h3>
          <div className="mt-6 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              Trade press and first-person accounts in 2025 describe a plural
              pressure: chronological photo community → algorithmic feed; still
              craft →{" "}
              <em className="not-italic text-[var(--ink)]">
                Reels / video priority
              </em>
              ; peer discovery → ads and suggested content; legitimacy by
              follower count → people{" "}
              <em className="not-italic text-[var(--ink)]">
                left, or went quiet
              </em>
              . Vanity metrics matter. Format shift and ad load matter too.
              Overclaiming “vanity alone” weakens the case — the parallel is
              LinkedIn becoming influencer and AI spam while endorsements went
              to zero. On LinkedIn the exit is often silence: same people still
              have profiles, but the serious reputation work moved elsewhere.
            </p>
            <p>
              They are not converging on a single replacement. The residue{" "}
              <em className="not-italic text-[var(--ink)]">right now</em> is
              plural: Flickr groups, Glass, Substack, Discord, personal sites.
              That is a snapshot, not a stable end state. Flickr hollowed once
              already; Substack and Discord can run the same arc if cost
              collapses there.
            </p>
            <p className="surface-2 px-4 py-3 text-[15px] leading-relaxed text-[var(--ink)]">
              The documented pattern: when signals cheapened{" "}
              <em className="not-italic">and</em> the dominant format shifted,
              people who cared about still craft moved the binding work
              elsewhere. Receipts below.
            </p>
          </div>

          <p className="mt-10 text-[12px] font-medium tracking-[0.06em] text-[var(--ink-3)]">
            The exits, in order
          </p>
          <ol className="mt-4 space-y-4 text-[14px] leading-relaxed text-[var(--ink-2)]">
            <li className="flex gap-3">
              <span className="tabular shrink-0 font-mono text-[11px] text-[var(--ink-3)]">
                Jan 2025
              </span>
              <span>
                Digital Camera World: algorithm fatigue{" "}
                <em className="not-italic text-[var(--ink)]">and</em> video
                push; Reddit consensus leans Flickr for chronological,
                craft-focused sharing.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="tabular shrink-0 font-mono text-[11px] text-[var(--ink-3)]">
                Sep 2025
              </span>
              <span>
                Kwame Johnson: ~1000 days off Instagram; values Flickr and Glass
                for no algorithm; builds Discord; multi-venue future.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="tabular shrink-0 font-mono text-[11px] text-[var(--ink-3)]">
                May 2025
              </span>
              <span>
                Fstoppers / Tedford: metrics mentality plus Reels crowding
                stills — a dual mechanism, not vanity alone.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="tabular shrink-0 font-mono text-[11px] text-[var(--ink-3)]">
                —
              </span>
              <span>
                FlakPhoto / Thurston and others: Substack and blogging
                migration; owned attention as higher-binding than vanity reach —
                for now.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* Full-bleed scroll hinge */}
      <div className="cs-hinge" aria-hidden={false}>
        <div className="cs-hinge-inner">
          <p className="text-[1.5rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.85rem]">
            Then price the signal.
          </p>
        </div>
      </div>

      {/* LAB */}
      <section
        id="lab"
        className="cs-fade-up mx-auto mt-12 w-full max-w-6xl px-5 sm:mt-16 sm:px-6"
      >
        <h2 className="max-w-3xl text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
          Raise the cost. Watch who stays.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-[1.65] text-[var(--ink-2)]">
          One slider sets what a signal costs the sender. The seeded market
          model shows whether reach still tracks craft — or whether the people
          who cared leave.
        </p>
        <div className="mt-8">
          <SignalLab />
        </div>
      </section>

      {/* LINKEDIN */}
      <section
        id="linkedin"
        className="cs-fade-up mx-auto mt-20 max-w-6xl px-5 sm:mt-24 sm:px-6"
      >
        <div className="max-w-3xl">
          <h2 className="text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
            Why LinkedIn endorsements died.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              LinkedIn skill endorsements were the same shape as public
              name-backed belief: a named person attests to your skill in
              public. They went to approximately zero as a hiring signal once
              the act cost nothing, scaled without limit, and became reciprocal
              — people endorse for accepting a connection request. Recruiters
              say hiring managers do not care about the counts. Contemporaries
              noted strangers endorsing unobserved skills and “scratch my back”
              loops.
            </p>
            <p>
              That is cost collapse in pure form. The thesis does not survive if
              Cosign becomes LinkedIn-endorsement theater with better
              typography. Ease of finding people is fine. Collapse of downside
              is fatal.
            </p>
          </div>

          <p className="mt-10 text-[12px] font-medium tracking-[0.06em] text-[var(--ink-3)]">
            The same collapse on LinkedIn
          </p>
          <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
            {(
              [
                [
                  "2009",
                  "500+ connection cap",
                  "already on profiles (documented by early 2009) — network size turned into a vanity badge while the exact count hid.",
                ],
                [
                  "2012",
                  "Skill endorsements",
                  "launch (Sep 24, 2012) — one-click public name-backed belief. Cost collapses into reciprocal taps.",
                ],
                [
                  "2017",
                  "Broetry",
                  "floods the feed (named Dec 2017) — performance posts game attention the way Reels later game Instagram.",
                ],
                [
                  "2021",
                  "Creator Mode",
                  "(Mar 30, 2021) — Follow over Connect; LinkedIn leans into influencer format shift.",
                ],
                [
                  "2024",
                  "Community Top Voice",
                  "badge farmed via collaborative articles, then retired (Oct 8, 2024) — automated prestige collapses under quality pressure.",
                ],
              ] as const
            ).map(([year, title, body]) => (
              <li key={year} className="flex gap-3 border-b border-[var(--line)] pb-3 last:border-0">
                <span className="w-12 shrink-0 font-mono text-[11px] tabular text-[var(--ink-3)]">
                  {year}
                </span>
                <span>
                  <strong className="font-medium text-[var(--ink)]">
                    {title}
                  </strong>{" "}
                  {body}
                </span>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-[1.25rem] font-medium tracking-tightish text-[var(--ink)]">
            What would make a Cosign costly.
          </h3>
          <div className="mt-6 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>Keep skin in the game:</p>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                <strong className="font-medium text-[var(--ink)]">
                  Specific why, not a tap.
                </strong>{" "}
                Force attributed substance — what ERE-style critiques asked
                LinkedIn to require — so drive-by reciprocal spam is expensive
                in time and reputation.
              </li>
              <li>
                <strong className="font-medium text-[var(--ink)]">
                  Scarcity and non-reciprocity.
                </strong>{" "}
                Unlimited mutual endorsements emptied the signal. Artificial
                scarcity (finite serious vouches) raises information value.
              </li>
              <li>
                <strong className="font-medium text-[var(--ink)]">
                  Tie upward to expensive commitments.
                </strong>{" "}
                The ladder above a public cosign is private would-work-with,
                warm intro, hire, check, IRL invite. Cosign stays meaningful
                when it routes toward those, not when it competes with likes.
              </li>
              <li>
                <strong className="font-medium text-[var(--ink)]">
                  Downside for false positives.
                </strong>{" "}
                If a bad cosign costs the cosigner nothing, the graph becomes
                LinkedIn again.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PUNCHLINE */}
      <section
        id="punchline"
        className="cs-fade-up mx-auto mt-20 max-w-6xl px-5 sm:mt-24 sm:px-6"
      >
        <div className="max-w-3xl">
          <h2 className="text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
            Keep the expensive ones expensive.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              A cosign is the other kind of signal. It costs them something if
              they are wrong. Cosign is not a bigger network. It is a smaller,
              more expensive one, on purpose.
            </p>
          </div>
        </div>

        {/* Free vs named — desktop table */}
        <div className="surface cs-table-wrap cs-table-desktop mt-8">
          <table className="cs-table w-full min-w-[32rem] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-[var(--ink-3)] sm:px-5">
                  &nbsp;
                </th>
                <th
                  className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] sm:px-5"
                  style={{ color: "var(--vanity)" }}
                >
                  Free signal
                </th>
                <th
                  className="px-4 py-3 text-[11px] font-medium tracking-[0.06em] sm:px-5"
                  style={{ color: "var(--gold)" }}
                >
                  Signal with a name
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--ink-2)]">
              {TABLE_ROWS.map(({ row, free, named, tag }, i, arr) => (
                <tr
                  key={row}
                  className={
                    i < arr.length - 1 ? "border-b border-[var(--line)]" : ""
                  }
                >
                  <th className="px-4 py-3 text-[12px] font-medium text-[var(--ink-3)] sm:px-5">
                    {row}
                    {tag ? <span className="cs-scarcity">{tag}</span> : null}
                  </th>
                  <td
                    className="px-4 py-3 sm:px-5"
                    style={{ color: "var(--vanity)" }}
                  >
                    {free}
                  </td>
                  <td
                    className="px-4 py-3 font-medium sm:px-5"
                    style={{ color: "var(--gold)" }}
                  >
                    {named}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stack */}
        <div className="cs-table-stack mt-8">
          {TABLE_ROWS.map(({ row, free, named, tag }) => (
            <article key={row}>
              <div className="text-[12px] font-medium text-[var(--ink-3)]">
                {row}
                {tag ? <span className="cs-scarcity">{tag}</span> : null}
              </div>
              <dl className="mt-3 space-y-2 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt style={{ color: "var(--vanity)" }}>Free</dt>
                  <dd style={{ color: "var(--vanity)" }}>{free}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt style={{ color: "var(--gold)" }}>Named</dt>
                  <dd className="font-medium" style={{ color: "var(--gold)" }}>
                    {named}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <div className="max-w-3xl">
          <div className="mt-10 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              a16z’s public framing is blunt enough: belief is private
              conviction you can invest — time, attention, access, reputation,
              money — and affiliation makes that belief legible. Vouches (a
              tweet, an invite, an introduction, an angel check) are forms of a
              co-sign. Read that list carefully: a tweet and a check are not the
              same cost.
            </p>
            <p>
              Instagram had a timeline where craft{" "}
              <em className="not-italic text-[var(--ink)]">
                left, or went quiet
              </em>
              . LinkedIn has a shorter second timeline with the same shape —
              cheap reputation products, then collapse. On LinkedIn the exit is
              silence: people keep a profile while the serious graph moves off.
            </p>
          </div>

          <div className="mt-10 space-y-5 text-base leading-[1.65] text-[var(--ink-2)]">
            <p>
              As AI makes applications, outreach, and synthetic social proof
              abundant, undifferentiated signals get cheaper. The human layer —
              who noticed, who believes, who will put a name{" "}
              <em className="not-italic text-[var(--ink)]">and a stake</em> on
              it — gets relatively more valuable. Cosign making intros and
              reputation easier is the point. Cosign making belief{" "}
              <em className="not-italic text-[var(--ink)]">costless</em> would
              be the LinkedIn failure mode.
            </p>
            <p className="text-[var(--ink)]">
              Cosign is not “another graph.” Read against Cheap Signal, it is a
              costly-commitment instrument: attributable belief that must stay
              expensive in a world that already watched public endorsements die
              once.
            </p>
            <p className="text-[var(--ink)]">
              Cosign’s gated door already signs you in with X. The ecosystem
              moved serious reputation off LinkedIn; Cosign is putting a price
              back on it.
            </p>
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section
        id="sources"
        className="cs-fade-up mx-auto mt-20 max-w-6xl px-5 pb-8 sm:mt-24 sm:px-6"
      >
        <h2 className="text-[1.65rem] font-medium tracking-tightish text-[var(--ink)] sm:text-[1.9rem]">
          Where this is from.
        </h2>
        <ul className="cs-receipts cs-receipts-grid mt-8">
          {SOURCES.map((s) => (
            <li key={s.label}>
              <span className="cs-date">{s.date}</span>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="surface mt-10 max-w-3xl p-5 text-[15px] leading-relaxed text-[var(--ink-2)]">
          <p className="text-[12px] font-medium tracking-[0.04em] text-[var(--ink)]">
            Notes
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Lab numbers come from a seeded twelve-round market model
              (creators, watchers, cost) — not live telemetry.
            </li>
            <li>
              Residue venues (Flickr, Glass, Substack, Discord) are a snapshot,
              not a stable end state.
            </li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-[12px] text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Prithvi Datla</span>
        <span>25 Sep 2026</span>
      </footer>
    </div>
  );
}
