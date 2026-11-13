import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function stage(page: Page, name: string) {
  await page
    .locator('.lesson-stages')
    .getByRole('button', { name: new RegExp(name) })
    .click();
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText(name);
}
async function saved(page: Page) {
  await expect(page.locator('.device-button')).toContainText('Đã lưu trên thiết bị này');
}

test('all lesson modules expose source theory, guide, small exercises, full exercises and review', async ({
  page,
}) => {
  await page.goto('/#courses');
  await expect(page.locator('.lesson-card')).toHaveCount(17);
  await page.locator('.lesson-card').filter({ hasText: 'Social Dialogue' }).click();
  await expect(page.locator('.lesson-stages button')).toHaveCount(5);
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Lý thuyết');
  await expect(page.locator('.source-section[open]')).toContainText('Bản chất');
  await stage(page, 'Hướng dẫn làm bài');
  await expect(page.locator('.source-section[open]')).toContainText('Pre-listening');
  await page
    .getByRole('textbox', { name: 'Ghi chú của bước này' })
    .fill('Predict the word class before listening.');
  await stage(page, 'Bài tập nhỏ');
  await page.locator('.source-section>summary').filter({ hasText: /^E1/ }).click();
  await page.getByRole('textbox', { name: /^Bài làm: E1/ }).fill('1. BEERNE\n2. JARVIS');
  await page.getByRole('button', { name: 'Đánh dấu học xong', exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Bài tập nhỏ');
  await page.locator('.source-section>summary').filter({ hasText: /^E1/ }).click();
  await expect(page.getByRole('textbox', { name: /^Bài làm: E1/ })).toHaveValue('1. BEERNE\n2. JARVIS');
  await expect(page.getByRole('button', { name: 'Đã đánh dấu học xong', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await stage(page, 'Hướng dẫn làm bài');
  await expect(page.getByRole('textbox', { name: 'Ghi chú của bước này' })).toHaveValue(
    'Predict the word class before listening.',
  );
  await stage(page, 'Bài tập đầy đủ');
  await expect(page.locator('.lesson-table-scroll').first()).toContainText('Michael');
  await page.getByText('Audio của bước này (1)', { exact: true }).click();
  await expect(page.locator('audio')).toHaveAttribute(
    'src',
    '/media/curriculum/listening-Part1_Full_Test.mp3',
  );
  await stage(page, 'Đáp án & xem lại');
  await expect(page.locator('.source-section[open]')).toContainText('Braithwaite');
});

test('desktop and mobile lessons render source material without horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#lesson/listening-1/theory');
    await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Lý thuyết');
    if (width === 390) await expect(page.locator('.lesson-source-mobile summary')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `.impeccable/review/lesson-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await stage(page, 'Bài tập nhỏ');
    await page.locator('.source-section>summary').filter({ hasText: /^E1/ }).click();
    await expect(page.getByRole('textbox', { name: /^Bài làm: E1/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `.impeccable/review/small-exercises-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  }
  expect(errors).toEqual([]);
});

test('Writing source charts and model examples are available without exposing models by default', async ({
  page,
}) => {
  await page.goto('/#lesson/writing-1/full');
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Bài tập đầy đủ');
  await page
    .locator('.source-section>summary')
    .filter({ hasText: /^Task 1 [·–-] Three London bakeries/ })
    .click();
  const image = page.locator('.source-section[open] img').first();
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  await page.goto('/#lesson/writing-2/full');
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Bài tập đầy đủ');
  const model = page
    .locator('.source-section')
    .filter({ has: page.locator('summary').filter({ hasText: /^M1 / }) });
  await expect(model).not.toHaveAttribute('open', '');
});

test('lesson notes and stage progress survive backup export and import', async ({ page }) => {
  await page.goto('/#lesson/reading-1/guide');
  await page
    .getByRole('textbox', { name: 'Ghi chú của bước này' })
    .fill('Check facts; never guess missing information.');
  await page.getByRole('button', { name: 'Đánh dấu học xong', exact: true }).click();
  await saved(page);
  await page.locator('.device-button').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Xuất toàn bộ dữ liệu' }).click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error('Missing backup');
  const backup = JSON.parse(await readFile(path, 'utf-8'));
  expect(backup.lessons['reading-1'].completed).toContain('guide');
  expect(backup.lessons['reading-1'].notes['guide/notes']).toContain('never guess');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Xóa dữ liệu', exact: true }).click();
  await saved(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type=file]').setInputFiles(path);
  await expect(page.getByRole('status')).toContainText('Đã nhập xong');
  await saved(page);
  await page.goto('/#lesson/reading-1/guide');
  await expect(page.getByRole('textbox', { name: 'Ghi chú của bước này' })).toHaveValue(
    'Check facts; never guess missing information.',
  );
});

test('a failed lesson download offers retry instead of silently showing an exercise', async ({ page }) => {
  await page.route('**/curriculum/listening-2.json', route => route.abort());
  await page.goto('/#lesson/listening-2/theory');
  await expect(page.getByRole('alert')).toContainText('Không tải được bài học');
  await page.unroute('**/curriculum/listening-2.json');
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await expect(page.locator('.lesson-stage-heading h2')).toHaveText('Lý thuyết');
});
