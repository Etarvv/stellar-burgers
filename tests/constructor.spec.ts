import { test, expect, Page } from '@playwright/test';
const path = require('path');
const fs = require('fs');

const hideDevServerOverlay = async (page: Page) => {
  await page.evaluate(() => {
    const overlays = document.querySelectorAll<HTMLElement>('#webpack-dev-server-client-overlay');
    overlays.forEach(el => el.style.display = 'none');
  });
};

test.describe('Конструктор бургера', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    const harsDir = path.join(__dirname, 'hars');
    if (!fs.existsSync(harsDir)) {
      fs.mkdirSync(harsDir, { recursive: true });
    }

    const harFiles = ['ingredients.har', 'order.har', 'user.har'];
    harFiles.forEach((file) => {
      const filePath = path.join(harsDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ log: { entries: [] } }));
      }
    });

    const updateHar = process.env.UPDATE_HAR === 'true';

    await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
      url: '**/api/ingredients',
      update: updateHar,
    });
    await page.routeFromHAR(path.join(harsDir, 'order.har'), {
      url: '**/api/orders',
      update: updateHar,
    });

    // Начинаем слушать ответ до перехода
    const ingredientsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/ingredients') && response.status() === 200,
      { timeout: 10000 }
    );

    await page.goto('/', { waitUntil: 'networkidle' });
    await hideDevServerOverlay(page);

    await ingredientsResponse;
  });

  test('добавление ингредиента в конструктор', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: /Краторная булка/ });
    await expect(bunCard).toBeVisible({ timeout: 30000 });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const topBun = page.getByText(/Краторная булка.*\(верх\)/);
    const bottomBun = page.getByText(/Краторная булка.*\(низ\)/);
    await expect(topBun).toBeVisible();
    await expect(bottomBun).toBeVisible();

    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: /Филе Люминесцентного тетраодонтимформа/ });
    await expect(fillingCard).toBeVisible();
    await fillingCard.getByRole('button', { name: 'Добавить' }).click();

    const fillingInConstructor = page
      .getByText(/Филе Люминесцентного тетраодонтимформа/)
      .nth(1);
    await expect(fillingInConstructor).toBeVisible();
  });

  test('открытие и закрытие модального окна ингредиента', async ({ page }) => {
    const ingredientCard = page
      .getByRole('listitem')
      .filter({ hasText: /Краторная булка/ });
    await ingredientCard.click();

    const ingredientNameHeading = page.getByRole('heading', { name: /Краторная булка/ });
    await expect(ingredientNameHeading).toBeVisible({ timeout: 30000 });

    const closeButton = page.locator('h3:has-text("Детали ингредиента") + button');
    await closeButton.click();
    await expect(ingredientNameHeading).not.toBeVisible();
  });

  test('создание заказа и очистка конструктора', async ({ page }) => {
    await page.route('**/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.com', name: 'Test User' }
        })
      });
    });

    const baseUrl = 'http://localhost:4000';
    await page.context().addCookies([
      { name: 'accessToken', value: 'fake-access-token', url: baseUrl },
      { name: 'refreshToken', value: 'fake-refresh-token', url: baseUrl },
    ]);
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'fake-access-token');
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    // Начинаем слушать ответ до перезагрузки
    const ingredientsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/ingredients') && response.status() === 200,
      { timeout: 10000 }
    );

    await page.reload({ waitUntil: 'networkidle' });
    await hideDevServerOverlay(page);

    await ingredientsResponse;

    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: /Краторная булка/ });
    await expect(bunCard).toBeVisible({ timeout: 30000 });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: /Филе Люминесцентного тетраодонтимформа/ });
    await expect(fillingCard).toBeVisible();
    await fillingCard.getByRole('button', { name: 'Добавить' }).click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderNumberElement = page.locator('h2').filter({ hasText: /^\d+$/ });
    await expect(orderNumberElement).toBeVisible({ timeout: 15000 });
    const orderNumber = await orderNumberElement.textContent();
    expect(orderNumber).not.toBeNull();
    expect(orderNumber).toMatch(/\d+/);

    await page.keyboard.press('Escape');
    await expect(orderNumberElement).not.toBeVisible();

    await expect(page.getByText(/\(верх\)/)).toHaveCount(0);
    await expect(page.getByText(/\(низ\)/)).toHaveCount(0);
    await expect(page.getByText('Выберите начинку').first()).toBeVisible();
    const fillingItems = page.locator('.burger_constructor .elements li');
    await expect(fillingItems).toHaveCount(0);
  });
});