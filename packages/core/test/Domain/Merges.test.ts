import { Merge } from '../../src';
import { demo } from './Range.test';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Test Merges getByRowColumn', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 1,
            startColumn: 1,
            endRow: 5,
            endColumn: 5,
        },
        {
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        },
    ]);
    expect(merges.getByRowColumn(2, 2)).not.toBeUndefined();
});

test('Test Merges remove', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 1,
            startColumn: 1,
            endRow: 5,
            endColumn: 5,
        },
        {
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        },
    ]);
    expect(
        merges.remove({
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        }).length
    ).toEqual(1);
    expect(merges.size()).toEqual(1);
});

test('Test Merges size', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 1,
            startColumn: 1,
            endRow: 5,
            endColumn: 5,
        },
        {
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        },
    ]);
    expect(merges.size()).toEqual(2);
});

test('Test Merges add', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 1,
            startColumn: 1,
            endRow: 5,
            endColumn: 5,
        },
        {
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        },
    ]);
    expect(merges.size()).toEqual(2);
    merges.add({
        startRow: 16,
        startColumn: 16,
        endRow: 20,
        endColumn: 20,
    });
    expect(merges.size()).toEqual(3);
});

test('Test Merges union', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 0,
            startColumn: 0,
            endRow: 5,
            endColumn: 5,
        },
    ]);
    const rect = { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 };
    expect(merges.union(rect)).toEqual(rect);
});

test('Test Merges getMergedRanges', () => {
    let { worksheet } = demo();
    const merges = new Merge(worksheet, [
        {
            startRow: 1,
            startColumn: 1,
            endRow: 5,
            endColumn: 5,
        },
        {
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        },
    ]);
    expect(
        merges.getMergedRanges({
            startRow: 6,
            startColumn: 6,
            endRow: 10,
            endColumn: 10,
        })
    ).not.toBeUndefined();
});
