'use client';

import { PanelRouteError } from './_components/panel-error';

export default function PanelError({ reset }: { reset: () => void }) {
  return <PanelRouteError reset={reset} title="We could not load the panel" />;
}
