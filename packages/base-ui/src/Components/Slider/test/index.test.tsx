import { render } from '@testing-library/react';

import { Slider } from '..';

describe('input', () => {
    test('input', () => {
        // const dom = document.styleSheets[0];
        // console.dir(dom);
        const { container } = render(<Slider value={2} min={10} max={200} step={1} className="slider" style={{ color: 'red' }} />);

        expect(container);
    });
    // test('input event', () => {
    //     let a = 1;
    //     const { container } = render(<Input value="test" readonly onClick={() => a++} disabled placeholder="haha" className="test" />);
    //     fireEvent.click(document.querySelector('.test')!);
    //     expect(a).toEqual(2);
    // });
});
