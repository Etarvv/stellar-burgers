/// <reference types="node" />
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
    await page.routeFromHAR(path.join(harsDir, 'user.har'), {
      url: '**/auth/user',
      update: updateHar,
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await hideDevServerOverlay(page);
  });

  test('добавление ингредиента в конструктор', async ({ page }) => {
    const bunCard = page
      .getByRole('listitem')
      .filter({ hasText: /Краторная булка/ });
    await expect(bunCard).toBeVisible({ timeout: 30000 });

    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const constructor = page.locator('section:has-text("Оформить заказ")');
    const topBun = constructor.getByText(/Краторная булка.*\(верх\)/);
    const bottomBun = constructor.getByText(/Краторная булка.*\(низ\)/);
    await expect(topBun).toBeVisible();
    await expect(bottomBun).toBeVisible();

    const fillingCard = page
      .getByRole('listitem')
      .filter({ hasText: /Филе Люминесцентного тетраодонтимформа/ });
    await expect(fillingCard).toBeVisible();
    await fillingCard.getByRole('button', { name: 'Добавить' }).click();

    const fillingInConstructor = constructor
      .getByText(/Филе Люминесцентного тетраодонтимформа/);
    await expect(fillingInConstructor).toBeVisible();
  });

  test('открытие и закрытие модального окна ингредиента', async ({ page }) => {
    const ingredientCardLink = page
      .getByRole('listitem')
      .filter({ hasText: /Краторная булка/ })
      .getByRole('link');
    await ingredientCardLink.click();

    const modal = page.locator('div:has(h3:has-text("Детали ингредиента"))');
    const ingredientNameHeading = modal.getByRole('heading', { name: /Краторная булка/ });
    await expect(ingredientNameHeading).toBeVisible({ timeout: 10000 });

    const closeButton = modal.locator('button');
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

    await page.reload({ waitUntil: 'networkidle' });
    await hideDevServerOverlay(page);

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

    const orderIdText = page.getByText('идентификатор заказа');
    await expect(orderIdText).toBeVisible({ timeout: 15000 });

    const orderModal = orderIdText.locator('..');
    const orderNumberElement = orderModal.locator('h2').filter({ hasText: /^\d+$/ });
    const orderNumber = await orderNumberElement.textContent();
    expect(orderNumber).toBe('9860');

    await page.keyboard.press('Escape');
    await expect(orderIdText).not.toBeVisible();

    const constructor = page.locator('section:has-text("Оформить заказ")');
    await expect(constructor.getByText('Выберите начинку')).toBeVisible({ timeout: 5000 });
    await expect(constructor.getByText(/\(верх\)/)).toHaveCount(0);
    await expect(constructor.getByText(/\(низ\)/)).toHaveCount(0);
    const fillingTexts = constructor.getByText(/Филе Люминесцентного тетраодонтимформа/);
    await expect(fillingTexts).toHaveCount(0);
  });
});