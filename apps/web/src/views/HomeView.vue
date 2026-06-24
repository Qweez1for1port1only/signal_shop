<template>
  <main class="bg-paper">
    <section class="container-page py-8 sm:py-12">
      <div class="grid overflow-hidden rounded-[1.75rem] border border-slate-300 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div class="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
          <p class="eyebrow">Новая техника без лишнего шума</p>
          <h1 class="mt-5 max-w-3xl text-[2.35rem] font-black leading-[1] tracking-[-0.045em] text-ink min-[380px]:text-5xl sm:text-7xl lg:text-[5.7rem]">
            Выбирайте.<br /><span class="text-accent">Подключайте.</span><br />Пользуйтесь.
          </h1>
          <p class="mt-7 max-w-xl text-base font-semibold leading-7 text-steel sm:text-lg">
            Каркас магазина с лаконичным интерфейсом, крупной типографикой и понятной навигацией. Каталог, корзина и кабинет появятся в следующих шагах.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#interface" class="btn-primary">Посмотреть стиль</a>
            <a href="#principles" class="btn-secondary">Принципы интерфейса</a>
          </div>
        </div>

        <div class="relative min-h-[420px] overflow-hidden bg-ink p-7 text-white sm:min-h-[560px] sm:p-10">
          <div class="absolute -right-20 -top-16 size-72 rounded-full border-[42px] border-amberline" />
          <div class="absolute -bottom-24 -left-16 size-80 rounded-full border-[54px] border-accent" />
          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-start justify-between gap-4">
              <span class="rounded-full border border-white/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">SIGNAL / 01</span>
              <span class="grid size-14 place-items-center rounded-full bg-amberline text-2xl font-black text-ink">↗</span>
            </div>
            <div class="max-w-sm rounded-[1.5rem] bg-white p-6 text-ink shadow-2xl">
              <p class="text-xs font-black uppercase tracking-[0.2em] text-accent">Frontend base</p>
              <p class="mt-3 text-4xl font-black tracking-tight">Vue + Tailwind</p>
              <p class="mt-3 text-sm font-semibold leading-6 text-steel">Сначала чистая оболочка, затем функциональные разделы.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="principles" class="container-page pb-12">
      <div class="grid gap-4 md:grid-cols-3">
        <article class="panel p-6">
          <p class="eyebrow">01</p>
          <h2 class="mt-3 text-2xl font-black text-ink">Меньше визуального шума</h2>
          <p class="mt-3 text-sm font-semibold leading-6 text-steel">Контрастные блоки, понятные кнопки и без лишней декоративности.</p>
        </article>
        <article class="panel p-6">
          <p class="eyebrow">02</p>
          <h2 class="mt-3 text-2xl font-black text-ink">Адаптивная сетка</h2>
          <p class="mt-3 text-sm font-semibold leading-6 text-steel">Контейнеры и карточки сразу рассчитаны на мобильный и десктоп.</p>
        </article>
        <article id="interface" class="panel p-6">
          <p class="eyebrow">03</p>
          <h2 class="mt-3 text-2xl font-black text-ink">Готовые состояния</h2>
          <p class="mt-3 text-sm font-semibold leading-6 text-steel">Базовые классы для форм, панелей и кнопок уже заданы в CSS-слое.</p>
        </article>
      </div>
    </section>
  </main>
</template>
