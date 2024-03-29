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
import { useTranslation } from 'react-i18next';

import style from './style.scss';

const HeaderWithLanguageSelect: FunctionalComponent = () => {
  const { t, i18n } = useTranslation();

  return (
    <div class="panel-heading">
      {t('Tournaments')}
      <div class={`control select ${style.langSelect}`}>
        <select value={i18n.language.split('-')[0]} onChange={(e) => i18n.changeLanguage(e.currentTarget.value)}>
          <option value="en">English</option>
          <option value="pl">Polski</option>
        </select>
      </div>
    </div>
  );
};

export default HeaderWithLanguageSelect;
