/*
 * Copyright (c) 2022  Grzegorz Kita
 *
 * This file is part of CompetiChess.
 *
 * CompetiChess is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * CompetiChess is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CompetiChess.  If not, see <http://www.gnu.org/licenses/>.
 */

import { FunctionalComponent, h } from 'preact';

import style from './style.scss';

const About: FunctionalComponent = () => {
  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        CompetiChess
      </p>
      <section class={`panel-block content ${style.centered}`}>
        <p><b>CompetiChess</b> - simple chess tournament manager, written with Preact, TypeScript and a bit of C++.</p>
        <p>
          It is a response for the already existing tournament managers. Some of them lack readability, many aren't
          cross-platform due to being a standalone desktop application. And most of them require registration.
        </p>
        <p>
          CompetiChess aims to fix all these issues while remaining as simple as possible. Doing what it should exactly do -
          managing a tournament and pairing players against each other. All from the browser, with offline capabilities.
        </p>
        <p>Application is actively evolving. With time, it might gain more features to provide better overall experience!</p>
        <p><strong>Core libraries used:</strong></p>
        <section class={style.thanksSection}>
          <div>
            <a href="https://preactjs.com/" rel="noopener noreferrer">
              <img
                src="assets/PreactLogo.webp"
                alt="Made with Bulma"
                width="250"
                height="75"
              />
            </a>
            <a href="https://bulma.io" rel="noopener noreferrer">
              <img
                src="https://bulma.io/images/made-with-bulma--semiblack.png"
                alt="Made with Bulma"
                width="256"
                height="48"
              />
            </a>
            <a href="https://www.typescriptlang.org" rel="noopener noreferrer">
              <img
                src="assets/TypeScript.svg"
                alt="TypeScript"
                width="48"
                height="48"
              />
            </a>
          </div>
          <p>
            <a class="has-text-link" rel="noopener noreferrer"
               href="https://github.com/BieremaBoyzProgramming/bbpPairings">
              bbpPairings
            </a>
            {' '}- Swiss pairing engine by Bierema Boyz Programming, licensed under Apache 2.0.
          </p>
          <p>
            <a class="has-text-link" rel="noopener noreferrer"
               href="https://emscripten.org">
              Emscripten
            </a>
            {' '}- a complete compiler toolchain to WebAssembly, using LLVM, with a special focus on speed, size, and the Web platform. Without it, integration with bbpPairings wouldn't be possible. Thanks a ton!
          </p>
          <a class="has-text-link" href="https://www.flaticon.com/free-icons/chess" title="chess icons">Chess icons created by Freepik - Flaticon</a>
        </section>
        <p class={style.footer}>
          Made with ❤️ by Grzegorz Kita. Copyright © 2021-2022
        </p>
      </section>
    </article>
  );
};


export default About;
