import { Component, createRef } from 'react';
import { JSXComponent } from '../../BaseComponent';
import { BaseDragProps, DragComponent } from '../../Interfaces';
import styles from './index.module.less';

// interface IProps {
//     isDrag: boolean;
// }
interface IState {
    left: string;
    top: string;
    width: number;
    height: number;
    rootW: number;
    rootH: number;
    rootL: number;
    rootT: number;
    offsetX: number;
    offsetY: number;
}

class Drag extends Component<BaseDragProps, IState> {
    root = createRef();

    constructor(props: BaseDragProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            left: '',
            top: '',
            width: 0,
            height: 0,
            rootW: 0,
            rootH: 0,
            rootL: 0,
            rootT: 0,
            offsetX: 0,
            offsetY: 0,
        };
    }

    onMouseUp(e: MouseEvent) {
        // e.stopPropagation();
        // this.root.current.removeEventListener('mousemove', this.onMouseMove);
    }

    onMouseDown(e: MouseEvent) {
        // e.stopPropagation();
        // if (!((e.target as Element).className === styles.drag)) return;
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;
        this.setState(
            {
                offsetX,
                offsetY,
            },
            () => {
                // this.root.current.addEventListener('mousemove', this.onMouseMove);
            }
        );
    }

    onMouseMove = (e: MouseEvent) => {
        // e.stopPropagation();
        const offsetX = this.state.offsetX;
        const offsetY = this.state.offsetY;

        // if (e.x === offsetX && e.y === offsetY) return;

        const x = e.x;
        const y = e.y;

        const left = `${x - offsetX}px`;
        const top = `${y - offsetY}px`;
        this.setState({
            top,
            left,
        });
    };

    getWindowRect() {
        const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const rootW = this.root.current.offsetWidth;
        const rootH = this.root.current.offsetHeight;
        const rootL = this.root.current.offsetLeft;
        const rootT = this.root.current.offsetTop;
        const top = `${(h - rootH) / 2}px`;
        const left = `${(w - rootW) / 2}px`;
        this.setState({
            width: w,
            height: h,
            rootW,
            rootH,
            rootL,
            rootT,
            top,
            left,
        });
    }

    componentDidMount() {
        if (this.props.isDrag) {
            this.getWindowRect();
        }
    }

    render() {
        const { isDrag, className = '' } = this.props;
        return (
            <>
                {isDrag ? (
                    <div
                        ref={this.root}
                        className={`${styles.drag} ${className}`}
                        style={{ top: this.state.top, left: this.state.left }}
                        onMouseUp={this.onMouseUp.bind(this)}
                        onMouseDown={this.onMouseDown.bind(this)}
                    >
                        {this.props.children}
                    </div>
                ) : (
                    this.props.children
                )}
            </>
        );
    }
}

export class UniverDrag implements DragComponent {
    render(): JSXComponent<BaseDragProps> {
        return Drag;
    }
}

export default Drag;
