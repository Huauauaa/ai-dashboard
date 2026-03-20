function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl shadow-slate-950/40 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-300">
          React + Tailwind CSS
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          GitHub Pages 初始化完成
        </h1>
        <p className="mt-4 text-base text-slate-300">
          项目已集成 Tailwind CSS，并配置了 GitHub Pages 自动部署工作流。
          你可以从 <code className="rounded bg-slate-800 px-2 py-1 text-sm">src/App.jsx</code> 开始开发页面。
        </p>
      </section>
    </main>
  )
}

export default App
