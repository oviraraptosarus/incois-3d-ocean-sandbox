import { SCIENCE_STORIES } from '../engine/storyEngine.js';

export class StoryModal {
  static show(onSelectStory) {
    const modalRoot = document.getElementById('modal-container');

    modalRoot.innerHTML = `
      <div id="story-backdrop" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
        <div class="relative w-full max-w-2xl glass-panel rounded-2xl p-6 text-white border border-slate-700 shadow-2xl">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-inner">
                📖
              </div>
              <div>
                <h2 class="font-bold text-sm tracking-wide text-white">Ocean Science Interactive Stories (Outreach)</h2>
                <p class="text-[11px] text-slate-400">Public education & research guided 3D tours for Indian Ocean dynamics</p>
              </div>
            </div>
            <button id="btn-close-story-menu" class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-lg">
              ✕
            </button>
          </div>

          <p class="text-xs text-slate-300 py-3 leading-relaxed">
            Select a guided 3D exploration story below. The platform will automatically fly the 3D camera to key oceanographic features, adjust vertical exaggeration, configure isosurfaces, and present scientific narration.
          </p>

          <!-- Stories List -->
          <div class="space-y-3 mt-1">
            ${SCIENCE_STORIES.map((s) => `
              <div data-story-id="${s.id}" class="story-card p-4 bg-slate-900/90 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition transform hover:-translate-y-0.5 shadow-lg group">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                    📍 ${s.region}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40">
                    ${s.badge}
                  </span>
                </div>
                <h3 class="font-bold text-sm text-white group-hover:text-cyan-300 transition">${s.title}</h3>
                <p class="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-normal">${s.summary}</p>
                <div class="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60 font-medium">
                  <span class="text-slate-500">${s.steps.length} Interactive 3D Chapters</span>
                  <span class="text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1 font-bold">
                    Start Story Tour ➔
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const closeMenu = () => {
      modalRoot.innerHTML = '';
    };

    document.getElementById('btn-close-story-menu').addEventListener('click', closeMenu);
    document.getElementById('story-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'story-backdrop') closeMenu();
    });

    modalRoot.querySelectorAll('.story-card').forEach((card) => {
      card.addEventListener('click', () => {
        const storyId = card.dataset.storyId;
        const story = SCIENCE_STORIES.find((s) => s.id === storyId);
        closeMenu();
        if (onSelectStory && story) onSelectStory(story);
      });
    });
  }

  // Active Story Narrative HUD Card in 3D Viewport
  static renderStoryHUD(story, currentStepIdx, onNextStep, onPrevStep, onExitStory) {
    let hud = document.getElementById('story-hud-overlay');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'story-hud-overlay';
      hud.className = 'absolute top-20 right-6 z-30 w-96 glass-panel rounded-2xl p-5 text-white shadow-2xl border border-cyan-500/40 animate-slideIn';
      document.getElementById('viewport-container').appendChild(hud);
    }

    const step = story.steps[currentStepIdx];
    const isFirst = currentStepIdx === 0;
    const isLast = currentStepIdx === story.steps.length - 1;

    hud.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            📖 ${story.title}
          </span>
          <button id="btn-exit-story" class="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer text-xs" title="Exit Story Mode">
            ✕ Exit
          </button>
        </div>

        <h4 class="font-bold text-sm text-cyan-300 mb-1.5">${step.title}</h4>
        <p class="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800 shadow-inner">
          ${step.narration}
        </p>

        <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span class="text-[11px] font-mono text-slate-400">
            Chapter <strong class="text-white">${currentStepIdx + 1}</strong> of ${story.steps.length}
          </span>
          <div class="flex items-center gap-2">
            <button id="btn-prev-step" ${isFirst ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer">
              ◀ Back
            </button>
            <button id="btn-next-step" class="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-md transform active:scale-95">
              ${isLast ? 'Finish 🏁' : 'Next ➔'}
            </button>
          </div>
        </div>
      </div>
    `;

    hud.querySelector('#btn-prev-step').addEventListener('click', () => {
      if (onPrevStep) onPrevStep();
    });

    hud.querySelector('#btn-next-step').addEventListener('click', () => {
      if (isLast) {
        hud.remove();
        if (onExitStory) onExitStory();
      } else if (onNextStep) {
        onNextStep();
      }
    });

    hud.querySelector('#btn-exit-story').addEventListener('click', () => {
      hud.remove();
      if (onExitStory) onExitStory();
    });
  }
}
