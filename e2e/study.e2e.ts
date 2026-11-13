import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function openActivity(page: Page, title: string) {
  await page.goto('/#practice');
  await page.locator('.activity-row').filter({ hasText: title }).click();
  await expect(page.locator('.workspace-heading h1')).toHaveText(title);
}
async function saved(page: Page) {
  await expect(page.locator('.device-button')).toContainText('Đã lưu trên thiết bị này');
}

test('desktop and mobile surfaces, real source assets, and no horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#today');
    await expect(page.getByRole('heading', { name: 'Tổng quan học tập' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('img[src^="/art/"]')).toHaveCount(0);
    await page.screenshot({
      path: `.impeccable/review/${width === 1440 ? 'desktop' : 'mobile'}.png`,
      fullPage: true,
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await openActivity(page, 'Westlake Sports Club');
    const audio = page.locator('audio');
    await expect(audio).toHaveAttribute('src', '/media/listening-part1.mp3');
    await page.screenshot({ path: `.impeccable/review/workspace-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Listening draft survives refresh; marking, saved mistake and retry work', async ({ page }) => {
  await openActivity(page, 'Westlake Sports Club');
  const answers = [
    'braithwaite',
    'August',
    '07700900452',
    'Fairview',
    'KF48BL',
    'Silver',
    'swimming',
    'shoulder',
    'monthly',
    '60',
  ];
  for (let i = 0; i < answers.length; i++)
    await page.getByRole('textbox', { name: new RegExp(`^Câu ${i + 1}:`) }).fill(answers[i]);
  await saved(page);
  await page.reload();
  await expect(page.getByRole('textbox', { name: /^Câu 7:/ })).toHaveValue('swimming');
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByRole('heading', { name: '9/10 câu đúng.' })).toBeVisible();
  await page.locator('.question.incorrect').getByRole('button', { name: 'Lưu để ôn' }).click();
  await saved(page);
  await page.getByRole('link', { name: 'Ôn lại', exact: true }).click();
  await expect(page.locator('.saved-question')).toContainText('Preferred indoor sport');
  await page.getByRole('button', { name: 'Luyện lại bài' }).click();
  await expect(page.getByRole('textbox', { name: /^Câu 7:/ })).toHaveValue('');
});

test('mobile Reading answers survive source/work tabs and produce evidence review', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openActivity(page, 'Museum: True / False / Not Given');
  await page.getByRole('button', { name: 'Bài làm của bạn', exact: true }).click();
  await page.locator('.question').nth(0).getByRole('radio', { name: 'TRUE', exact: true }).check();
  await page.locator('.question').nth(1).getByRole('radio', { name: 'FALSE', exact: true }).check();
  await page.locator('.question').nth(2).getByRole('radio', { name: 'NOT GIVEN', exact: true }).check();
  await page.getByRole('button', { name: 'Đề & tài liệu', exact: true }).click();
  await expect(page.locator('.passage')).toContainText('museum opened in 2004');
  await page.getByRole('button', { name: 'Bài làm của bạn', exact: true }).click();
  await expect(
    page.locator('.question').nth(1).getByRole('radio', { name: 'FALSE', exact: true }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  await expect(page.getByRole('heading', { name: '3/3 câu đúng.' })).toBeVisible();
  await expect(page.locator('.answer-review').nth(2)).toContainText('không đề cập');
});

test('Writing autosave, revisions, source chart and reveal tracking', async ({ page }) => {
  await openActivity(page, 'Food waste');
  await page.getByLabel('Dàn ý của bạn').fill('Causes: overbuying. Solutions: shopping lists.');
  await page
    .getByLabel('Bài viết của bạn', { exact: true })
    .fill('Households can reduce food waste by planning purchases.');
  await page.getByRole('button', { name: /Giữ một phiên bản/ }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByLabel('Bài viết của bạn', { exact: true })).toHaveValue(
    'Households can reduce food waste by planning purchases.',
  );
  await expect(page.getByText('Các phiên bản đã giữ (1)', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mở sớm bài mẫu' }).click();
  await page.getByRole('button', { name: 'Hoàn thành lượt luyện' }).click();
  await expect(page.locator('.result-banner')).toContainText('đã xem gợi ý hoặc bài mẫu');
  await openActivity(page, 'Three London bakeries');
  await expect(page.locator('.task-image')).toBeVisible();
  expect(
    await page
      .locator('.task-image')
      .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
  ).toBe(true);
});

test('microphone denial has a usable recovery path', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('denied', 'NotAllowedError');
    };
  });
  await openActivity(page, 'Study & university life');
  await page.getByRole('button', { name: 'Bắt đầu ghi âm', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa truy cập được micro');
  await expect(page.getByLabel('Vài từ khóa trước khi nói')).toBeEnabled();
});

test('recording persists and backup round-trips recordings, drafts and mistakes', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['microphone']);
  await openActivity(page, 'Study & university life');
  await page.getByRole('button', { name: 'Bắt đầu ghi âm', exact: true }).click();
  await expect(page.getByRole('button', { name: /Dừng ghi âm/ })).toBeVisible();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Dừng ghi âm/ }).click();
  await expect(page.getByRole('button', { name: 'Tải bản ghi' })).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tải bản ghi' })).toBeVisible();
  await page.locator('.device-button').click();
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Xuất toàn bộ dữ liệu' }).click(),
  ]);
  const path = await file.path();
  if (!path) throw new Error('Missing download');
  const backup = JSON.parse(await readFile(path, 'utf-8'));
  expect(backup.attempts[0].recordingData).toMatch(/^data:audio\//);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Xóa dữ liệu', exact: true }).click();
  await saved(page);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('input[type=file]').setInputFiles(path);
  await expect(page.getByRole('status')).toContainText('Đã đọc tệp');
  await saved(page);
  await page.reload();
  await expect(page.getByText('1 lượt học · 0 câu đã lưu · 1 bản ghi âm')).toBeVisible();
});

test('keyboard skip preserves route; empty search is recoverable', async ({ page }) => {
  await page.goto('/#today');
  await expect(page.getByRole('heading', { name: 'Tổng quan học tập' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Đến nội dung chính' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveURL(/#today$/);
  await page.getByRole('link', { name: 'Luyện tập', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tìm bài luyện' }).fill('unavailable-topic-xyz');
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy bài phù hợp.' })).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await expect(page.locator('.activity-row')).toHaveCount(6);
});

test('storage and audio failures are visible and do not claim saved work', async ({ page }) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = () => {
      throw new DOMException('quota', 'QuotaExceededError');
    };
  });
  await page.route('**/media/listening-part1.mp3', route => route.abort());
  await openActivity(page, 'Westlake Sports Club');
  await expect(page.locator('.storage-error')).toContainText('Chưa lưu được thay đổi');
  await expect(page.locator('.device-button')).toContainText('Chưa lưu được');
  await expect(page.getByRole('button', { name: 'Tải lại audio' })).toBeVisible();
  await page.getByRole('button', { name: 'Mở sớm bản chép lời' }).click();
  await expect(page.locator('.model-copy')).toContainText('Michael Braithwaite');
  await page.locator('.storage-error').getByRole('button', { name: 'Xuất dữ liệu' }).click();
  await expect(page.getByRole('button', { name: 'Xuất toàn bộ dữ liệu' })).toBeEnabled();
});
