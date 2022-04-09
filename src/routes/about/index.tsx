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
import { Trans, useTranslation } from 'react-i18next';

import constants from 'utils/index';

import style from './style.scss';

const About: FunctionalComponent = () => {
  const { t } = useTranslation();

  return (
    <article class={`panel is-primary ${style.panel}`}>
      <p class="panel-heading">
        {constants.appName}
      </p>
      <section class={`panel-block content centered ${style.padded}`}>
        <p>{t('About 1', { appName: constants.appName })}</p>
        <p>{t('About 2')}</p>
        <p>{t('About 3', { appName: constants.appName })}</p>
        <p>{t('About 4')}</p>
        <p><strong>{t('Core libraries used')}</strong></p>
        <section class={style.thanksSection}>
          <div>
            <a href="https://preactjs.com/">
              <img
                src="assets/PreactLogo.webp"
                alt="Preact.js"
                width="250"
                height="75"
              />
            </a>
            <a href="https://bulma.io">
              <img
                src="https://bulma.io/images/made-with-bulma--semiblack.png"
                alt="Made with Bulma"
                width="256"
                height="48"
              />
            </a>
            <a href="https://www.typescriptlang.org">
              <img
                src="assets/TypeScript.svg"
                alt="TypeScript"
                width="48"
                height="48"
              />
            </a>
          </div>
          <p>
            <Trans i18nKey="About bbpPairings">
              <a class="has-text-link" href="https://github.com/BieremaBoyzProgramming/bbpPairings">
                bbpPairings
              </a>
            </Trans>
          </p>
          <p>
            <Trans i18nKey="About Emscripten">
              <a class="has-text-link" href="https://emscripten.org">
                Emscripten
              </a>
            </Trans>
          </p>
          <a class="has-text-link" href="https://www.flaticon.com/free-icons/chess">
            {t('About icons')}
          </a>
        </section>
        <p class={style.footer}>
          {t('About - Made with love')}
          {' '}Copyright © 2021-2022
        </p>
      </section>
    </article>
  );
};


export default About;
