import { test, expect } from '@playwright/test';
import { PlaywrightHarnessEnvironment } from '../../dist/index';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';

test('MatButton - click()', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  const environment = await PlaywrightHarnessEnvironment.loader(
    page.locator('html')
  );
  const button = await environment.getHarness(
    MatButtonHarness.with({ selector: '#demo-button' })
  );
  await button.click();

  const message = page.getByText('CLICKED');

  await expect(message, {
    message: 'Message should be equal to CLICKED',
  }).toBeVisible();
});

test('MatSelect - select()', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  const environment = await PlaywrightHarnessEnvironment.loader(
    page.locator('html')
  );
  const select = await environment.getHarness(MatSelectHarness);
  await select.open();
  const options = await select.getOptions();
  expect(options.length, { message: 'Select should have 3 options' }).toBe(3);

  await options[2].click();
  const value = await select.getValueText();
  expect(value, { message: '"Tacos" should be selected' }).toBe('Tacos');
});

test('MatDatePicker - setValue()', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  const environment = await PlaywrightHarnessEnvironment.loader(
    page.locator('html')
  );

  const datepicker = await environment.getHarness(
    MatDatepickerInputHarness.with({ selector: '#demo-datepicker-input' })
  );
  await datepicker.setValue('9/27/1954');

  const value = await datepicker.getValue();

  expect(value, { message: 'Date should be 9/27/1954' }).toBe('9/27/1954');
});

test('MatDatePicker - selectCell()', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  const environment = await PlaywrightHarnessEnvironment.loader(
    page.locator('html')
  );

  const datepicker = await environment.getHarness(
    MatDatepickerInputHarness.with({ selector: '#demo-datepicker-input' })
  );
  await datepicker.setValue('9/27/1954');
  await datepicker.openCalendar();

  const calendar = await datepicker.getCalendar();
  await calendar.next();
  await calendar.selectCell({ text: '20' });

  const value = await datepicker.getValue();
  expect(value, { message: 'Date should be 10/20/1954' }).toBe('10/20/1954');
});
