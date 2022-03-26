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

import { MutableRef } from 'preact/hooks';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

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
        toast.error('Your browser doesn\'t support printing (e.g. Firefox for Android). Please use compatible browser to print.');
      } else if (toastId === undefined) {
        toastId = toast.info('Printing in progress', { isLoading: true, closeButton: false });
      }
    },
    onPrintError: () => toastId && toast.update(toastId, { render: 'An error occurred while printing, please try again.', isLoading: false, closeButton: true }),
    onAfterPrint: () => {
      toast.dismiss(toastId);
      toastId = undefined;
    },
    removeAfterPrint,
  });
};

export default usePrint;
