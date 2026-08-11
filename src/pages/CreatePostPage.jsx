import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const toneOptions = ['Professional', 'Casual', 'Enthusiastic', 'Informative', 'Humorous']
const languageOptions = ['EN-US', 'EN-GB', 'ES', 'FR', 'DE', 'JA']

const platformIcons = {
  LinkedIn: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Twitter: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75"/>
          <stop offset="20%" stopColor="#fa7e1e"/>
          <stop offset="40%" stopColor="#d62976"/>
          <stop offset="60%" stopColor="#962fbf"/>
          <stop offset="100%" stopColor="#4f5bd5"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)"/>
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
    </svg>
  ),
}

export default function CreatePostPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('Professional')
  const [language, setLanguage] = useState('EN-US')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['LinkedIn'])
  const [tags, setTags] = useState(['#PIXMoving', '#RoboBus'])
  const [newTag, setNewTag] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showToneDropdown, setShowToneDropdown] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  function togglePlatform(platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, '#')
    if (clean.length > 1 && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean])
    }
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  function addFiles(files) {
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isUnder5MB = file.size <= 5 * 1024 * 1024
      return isImage && isUnder5MB
    })

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(id) {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  function handleGenerate() {
    if (!prompt.trim()) return
    setIsGenerating(true)
    
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false)
      
      const newPost = {
        id: `PX-${Date.now()}`,
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        platform: selectedPlatforms[0] || 'LinkedIn',
        thumbClass: 'bg-gradient-to-br from-violet-200 to-fuchsia-400',
        score: Math.floor(Math.random() * 30) + 70,
        status: 'STAGING',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        caption: prompt,
        hashtags: tags,
        channels: selectedPlatforms,
      }
      
      navigate('/approval-queue', { state: { newPost } })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Generate Post</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Describe the content you want to create and let AI assist you.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Generate
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Prompt Console */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                PROMPT CONSOLE
              </p>
              <button className="text-neutral-400 hover:text-black">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the post in detail. e.g., 'Write a professional LinkedIn post announcing our new autonomous coffee cart fleet in Tokyo. Emphasize the sustainable design and modern aesthetics. Target audience is urban planners and tech enthusiasts. Tone should be innovative yet grounded.'"
              rows={8}
              className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
            
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Tone Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowToneDropdown(!showToneDropdown)
                    setShowLanguageDropdown(false)
                  }}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Tone: {tone}
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {showToneDropdown && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    {toneOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setTone(option)
                          setShowToneDropdown(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${
                          tone === option ? 'bg-neutral-100 font-medium text-black' : 'text-neutral-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowLanguageDropdown(!showLanguageDropdown)
                    setShowToneDropdown(false)
                  }}
                  className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {language}
                  <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {showLanguageDropdown && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    {languageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setLanguage(option)
                          setShowLanguageDropdown(false)
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${
                          language === option ? 'bg-neutral-100 font-medium text-black' : 'text-neutral-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="ml-auto text-xs text-neutral-400">{prompt.length} / 2000 chars</span>
            </div>
          </div>

          {/* Reference URL */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              REFERENCE URL
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com/inspiration"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
              />
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Add a link for the AI to extract context or analyze style.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Media Assets */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              MEDIA ASSETS
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
                isDragOver
                  ? 'border-black bg-neutral-100'
                  : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <svg className="mb-3 h-10 w-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-neutral-600">Drag & drop images here</p>
              <p className="mt-1 text-xs text-neutral-400">or click to browse (Max 5MB)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="mt-1 truncate text-xs text-neutral-500">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              ADDITIONAL DETAILS
            </p>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Specific instructions, platform notes (e.g., 'Keep it under 280 characters for Twitter', 'Include #FutureMobility hashtag')..."
              rows={4}
              className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
            />
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="text-neutral-400 hover:text-black"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  addTag(newTag)
                  setNewTag('')
                }}
                className="flex items-center"
              >
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="+ Tag"
                  className="w-16 rounded-full border border-dashed border-neutral-300 px-2 py-1 text-xs outline-none focus:border-black"
                />
              </form>
            </div>
          </div>

          {/* Platform Target */}
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="mb-4 text-xs font-semibold tracking-widest text-neutral-400">
              PLATFORM TARGET
            </p>
            <div className="space-y-3">
              {Object.entries(platformIcons).map(([platform, icon]) => (
                <label
                  key={platform}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="h-4 w-4 rounded border-neutral-300 accent-black"
                  />
                  <span className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-medium text-neutral-700">{platform}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center">
              {/* Spinner */}
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-black" />
              </div>
              
              <h3 className="mt-6 text-lg font-semibold text-black">Generating your post</h3>
              <p className="mt-2 text-center text-sm text-neutral-500">
                Our AI is crafting your content based on your prompt. This usually takes a few seconds.
              </p>
              
              <div className="mt-6 w-full">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Analyzing prompt...</span>
                  <span className="animate-pulse">●</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
