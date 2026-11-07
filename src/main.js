/**
 * Mission Remnants — Built for a Question
 * Main Application Entry Point
 * 
 * Orchestrates:
 * 1. Scroll-driven 3D Cinematic Prologue (ScrollPrologueController)
 * 2. Dedicated View Switching: Choice Hub <-> Chapters View <-> Mission Lab View
 * 3. Tactical Mission Lab Interactive Simulator (MissionLabGame)
 */

import { ScrollPrologueController } from './prologue/ScrollPrologueController.js';
import { MissionLabGame } from './home/MissionLabGame.js';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Prologue
  const prologue = new ScrollPrologueController();

  // 2. View Elements
  const choiceHubView = document.getElementById('choiceHubView');
  const chaptersPageView = document.getElementById('chaptersPageView');
  const missionLabPageView = document.getElementById('missionLabPageView');

  const btnOpenChapters = document.getElementById('btnOpenChapters');
  const btnOpenLab = document.getElementById('btnOpenLab');
  const btnBackFromChapters = document.getElementById('btnBackFromChapters');
  const btnBackFromLab = document.getElementById('btnBackFromLab');

  const navToHub = document.getElementById('navToHub');
  const navToChapters = document.getElementById('navToChapters');
  const navToLab = document.getElementById('navToLab');

  // 3. Mission Lab Game Engine (lazy initialized on view switch or early mount)
  const gameCanvas = document.getElementById('gameCanvas');
  let gameEngine = null;

  function ensureGameEngine() {
    if (!gameEngine && gameCanvas) {
      gameEngine = new MissionLabGame(gameCanvas, prologue.sound);
    }
  }

  // 4. View Switcher Helper
  function showView(viewName) {
    if (viewName === 'hub') {
      if (choiceHubView) choiceHubView.style.display = 'block';
      if (chaptersPageView) chaptersPageView.style.display = 'none';
      if (missionLabPageView) missionLabPageView.style.display = 'none';
      updateNavActive('hub');
    } else if (viewName === 'chapters') {
      if (choiceHubView) choiceHubView.style.display = 'none';
      if (chaptersPageView) chaptersPageView.style.display = 'block';
      if (missionLabPageView) missionLabPageView.style.display = 'none';
      updateNavActive('chapters');
      chaptersPageView?.scrollIntoView({ behavior: 'smooth' });
    } else if (viewName === 'lab') {
      if (choiceHubView) choiceHubView.style.display = 'none';
      if (chaptersPageView) chaptersPageView.style.display = 'none';
      if (missionLabPageView) missionLabPageView.style.display = 'block';
      updateNavActive('lab');
      ensureGameEngine();
      missionLabPageView?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function updateNavActive(current) {
    navToHub?.classList.toggle('is-active', current === 'hub');
    navToChapters?.classList.toggle('is-active', current === 'chapters');
    navToLab?.classList.toggle('is-active', current === 'lab');
  }

  // Event Listeners for Opening Options
  btnOpenChapters?.addEventListener('click', () => showView('chapters'));
  btnOpenLab?.addEventListener('click', () => showView('lab'));
  btnBackFromChapters?.addEventListener('click', () => showView('hub'));
  btnBackFromLab?.addEventListener('click', () => showView('hub'));

  navToHub?.addEventListener('click', () => showView('hub'));
  navToChapters?.addEventListener('click', () => showView('chapters'));
  navToLab?.addEventListener('click', () => showView('lab'));

  // 5. Connect Mission Lab Game Tabs
  const gameTabs = document.querySelectorAll('.game-tab');
  const instructions = document.getElementById('gameInstructions');

  gameTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      gameTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const mission = tab.dataset.mission;
      ensureGameEngine();
      if (gameEngine) {
        gameEngine.setMission(mission);
      }

      if (instructions) {
        if (mission === 'apollo') {
          instructions.innerHTML = '<span><span class="key-badge">MOUSE</span> Aim Crosshairs</span><span><span class="key-badge">SPACE / CLICK</span> Fire Laser Pulse</span>';
        } else if (mission === 'ingenuity') {
          instructions.innerHTML = '<span><span class="key-badge">W / UP / SPACE</span> Throttle Lift</span><span><span class="key-badge">A / D</span> Steer Left / Right</span>';
        } else if (mission === 'voyager') {
          instructions.innerHTML = '<span><span class="key-badge">BUTTON / CLICK</span> Step Receiver Frequency (8.419 GHz)</span>';
        }
      }
    });
  });

  // Primary Game Action Button
  const gameActionBtn = document.getElementById('gameActionBtn');
  gameActionBtn?.addEventListener('click', () => {
    ensureGameEngine();
    if (gameEngine) {
      gameEngine.handlePrimaryAction();
    }
  });

  // Replay Prologue Button
  const replayBtn = document.getElementById('replayPrologueBtn');
  replayBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Smooth Navigation Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
