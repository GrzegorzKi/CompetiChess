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

import { h } from 'preact';
import { MutableRef } from 'preact/hooks';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

import TransText from '@/TransText';

interface UsePrintProps {
  componentRef: MutableRef<any>;
  removeAfterPrint?: boolean;
  documentTitle?: string;
}

const usePrint = ({ componentRef, documentTitle, removeAfterPrint }: UsePrintProps): ReturnType<typeof useReactToPrint> => {
  let toastId: number | string | undefined;

  return useReactToPrint({
    content: () => componentRef.current,
    pageStyle: '.print-only { display: unset !important; }',
    documentTitle,
    onBeforePrint: () => {
      if (window.print === undefined) {
        toast.error(<TransText i18nKey='Printing not supported' />);
      } else if (toastId === undefined) {
        toastId = toast.info(<TransText i18nKey='Printing in progress' />, { isLoading: true, closeButton: false });
      }

      // Prevent focus on the element caused by tabbing
      const printWindow = document.querySelector('#printWindow');
      if (printWindow !== null) {
        printWindow.setAttribute('tabindex', '-1');
        printWindow.setAttribute('aria-hidden', 'true');
      }
    },
    onPrintError: () => toastId && toast.update(toastId, { render: <TransText i18nKey='Printing error' />, isLoading: false, closeButton: true }),
    onAfterPrint: () => {
      toast.dismiss(toastId);
      toastId = undefined;
    },
    removeAfterPrint,
    suppressErrors: true,
  });
};

export default usePrint;
