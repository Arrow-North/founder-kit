import type { KitData } from '../components/KitView';

// Dev-only fixtures for /kit/demo-<name>. Only loaded when import.meta.env.DEV is true.

interface Fixture {
  summary: { value: NonNullable<KitData['summary']> };
  phases: { value: NonNullable<KitData['phases']>['validate'] }[];
}

const DEMO_FIRST_NAME = 'Sam';

export async function loadDemoKit(name: string): Promise<KitData | null> {
  if (name === 'pending' || name === 'failed') {
    return {
      kitId: `demo-${name}`,
      status: name,
      firstName: DEMO_FIRST_NAME,
      summary: null,
      phases: null,
      error: name === 'failed' ? 'Demo failure' : null,
      warnings: [],
      createdAt: Date.now(),
    };
  }

  const fixtures = import.meta.glob<Fixture>('./fixtures/*.json', { import: 'default' });
  const load = fixtures[`./fixtures/${name}.json`];
  if (!load) return null;

  const fixture = await load();
  const [validate, design, build] = fixture.phases.map((phase) => phase.value);
  return {
    kitId: `demo-${name}`,
    status: 'ready',
    firstName: DEMO_FIRST_NAME,
    summary: fixture.summary.value,
    phases: { validate, design, build },
    error: null,
    warnings: [],
    createdAt: Date.now(),
  };
}
