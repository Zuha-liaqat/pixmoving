export default function Topbar({ onMenuClick = () => {} }) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-3 py-3 sm:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="shrink-0 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>
      <div className="flex w-full min-w-0 max-w-md items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 transition focus-within:border-black focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
        <svg
          className="h-4 w-4 shrink-0 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search assets, metadata, or tags..."
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          className="relative rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7a6 6 0 00-6-6h-.75a6 6 0 00-6 6v.75a8.967 8.967 0 01-2.311 6.022 23.848 23.848 0 005.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <button
          className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Help"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.86.416-1.45 1.235-1.45 2.161v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </button>
        <div className="ml-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white ring-2 ring-white shadow-sm">
            O1
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-sm font-medium text-black">Operator 01</p>
            <p className="text-xs text-neutral-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
