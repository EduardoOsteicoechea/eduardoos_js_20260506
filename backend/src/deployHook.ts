import { GITHUB_DEPLOY_TOKEN, GITHUB_REPO } from './constants/index.js';

/** Queue a production frontend rebuild after a post save (optional). */
export async function requestFrontendRebuild(): Promise<void> {
  const token = GITHUB_DEPLOY_TOKEN.trim();
  const repo = GITHUB_REPO.trim();
  if (!token || !repo) return;

  const response = await fetch(
    `https://api.github.com/repos/${repo}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ event_type: 'rebuild-frontend' }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn(
      `[deploy-hook] frontend rebuild dispatch failed (${response.status}): ${body}`,
    );
  }
}
