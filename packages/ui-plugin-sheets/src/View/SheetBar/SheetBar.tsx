import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameMutation,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/base-sheets';
import {
    AppContext,
    BaseComponentProps,
    BaseMenuItem,
    BaseSelectProps,
    Button,
    CustomLabel,
    Icon,
    IDisplayMenuItem,
    IMenuItem,
    Menu,
    MenuPosition,
    TabPane,
    Tabs,
} from '@univerjs/base-ui';
import { BooleanNumber, ICommandService, ICurrentUniverService, IKeyValue } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';
import { Component, createRef } from 'react';

import styles from './index.module.less';
import { ISheetBarMenuItem, SheetBarMenu } from './SheetBarMenu';

export interface BaseSheetBarProps extends BaseComponentProps, Omit<BaseSelectProps, 'children'> {
    children?: any[];
    index?: string;
    color?: string;
    sheetId?: string;
    style?: React.CSSProperties;
    hidden?: BooleanNumber;
    addSheet?: () => void;
    onMouseDown?: (e: MouseEvent) => void;
    selectSheet?: (slideItemIndex: number) => void;
    changeSheetName?: (sheetId: string, name: string) => void;
    dragEnd?: (elements: HTMLElement[]) => void;
    selected?: boolean;
}

type SheetState = {
    sheetList: BaseSheetBarProps[];
    menuList: BaseSheetBarProps[];
    sheetUl: BaseMenuItem[];
    menuItems: Array<IDisplayMenuItem<IMenuItem>>;
    showMenu: boolean;
    menuStyle: React.CSSProperties;
    draggable: boolean;
};

export class SheetBar extends Component<BaseSheetBarProps, SheetState> {
    static override contextType = AppContext;

    declare context: React.ContextType<typeof AppContext>;

    ref = createRef<SheetBarMenu>();

    sheetContainerRef = createRef<HTMLDivElement>();

    sheetContentRef = createRef();

    sheetBarContentRef = createRef();

    // 先生成移动对象的副本,移动对象固定定位,达到边界的时候将副本移位
    time = 0;

    target: any = null;

    cloneTarget: any = null;

    startLeft: number;

    startClientX: number;

    private _renderKey: number = 1;

    constructor(props: BaseSheetBarProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: BaseSheetBarProps) {
        this.state = {
            sheetList: [],
            sheetUl: [],
            menuList: [],
            menuItems: [],
            showMenu: false,
            menuStyle: {},
            draggable: false,
        };
    }

    // setstate
    setValue = (value: any, fn?: () => void) => {
        this.setState((prevState) => ({ ...value }), fn);
    };

    overGrid = () => {};

    // Right click to display menu
    contextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLDivElement;
        const worksheetId = target.dataset.id as string;

        // activate command
        // FIXME this.context type error
        const commandService: ICommandService = (this.context as IKeyValue).injector.get(ICommandService);
        commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
    };

    // Click the button to display the menu, if it is not in the current sheet, only switch the sheet after clicking
    onContextMenuClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();

        const target = e.currentTarget as HTMLDivElement;
        const worksheetId = target.dataset.id as string;

        const currentSheetId = this.getCurrentSheetId();

        if (worksheetId === currentSheetId) {
            this.showUlList(e);
        } else {
            // FIXME this.context type error
            const commandService: ICommandService = (this.context as IKeyValue).injector.get(ICommandService);
            commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
        }
    };

    // 显示下拉
    showSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        this.setState({
            showMenu: true,
        });
        // 点击外部隐藏子组件
        window.addEventListener('click', this.hideSelect);
    };

    // 隐藏下拉
    hideSelect = (e: MouseEvent) => {
        this.setState({
            showMenu: false,
        });
        window.removeEventListener('click', this.hideSelect);
    };

    // 点击不同sheet页显示ullist
    showUlList = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, cb?: () => void) => {
        new Promise<void>((resolve) => {
            const target = e.currentTarget as HTMLDivElement;
            resolve();
        }).then(() => {
            const currentTarget = (e.target as HTMLElement).closest(`.${styles.slideTabItem}`);
            if (currentTarget) {
                const currentRect = currentTarget.getBoundingClientRect();
                const left = `${currentRect.left}px`;
                const bottom = `${currentRect.height}px`;
                const top = 'auto';
                const right = 'auto';
                this.setState({
                    menuStyle: {
                        left,
                        bottom,
                        top,
                        right,
                    },
                });

                this.showSelect(e);

                cb && cb();
            }
        });
    };

    override componentDidUpdate() {}

    override componentDidMount() {
        this.props.getComponent?.(this);

        this._updateSheetBarStatus();
        this._setupStatusUpdate();
    }

    // Convenient for controller to control sheetBarMenu
    showMenuList(show: boolean) {
        this.ref.current?.showMenu(show);
    }

    getCurrentSheetId() {
        const sheetList = this.state.sheetList;
        const currentSheet = sheetList.find((sheet) => sheet.selected);
        return currentSheet?.sheetId;
    }

    // getSheetBarItem(item: BaseSheetBarProps) {
    //     return (
    //         <div
    //             onMouseDown={item.onMouseDown}
    //             onContextMenu={this.contextMenu}
    //             key={item.sheetId}
    //             data-id={item.sheetId}
    //             className={`${styles.slideTabItem} ${item.selected ? styles.slideTabActive : ''}`}
    //         >
    //             <div className={`${styles.slideTabContent}`}>
    //                 <div className={`${styles.slideTabDivider}`}></div>
    //                 <div className={`${styles.slideTabTitle}`}>
    //                     <span className={`${styles.slideTabSpan}`} style={{ padding: '2px 5px 2px 5px' }}>
    //                         <CustomLabel label={item.label} />
    //                     </span>
    //                 </div>
    //                 <div
    //                     className={`${styles.slideTabIcon}`}
    //                     data-slide-skip="true"
    //                     style={{ lineHeight: 1 }}
    //                     data-id={item.sheetId}
    //                     onClick={(e) => this.onContextMenuClick(e)}
    //                 >
    //                     <Icon.NextIcon />
    //                 </div>
    //             </div>
    //             <div className={`${styles.slideTabFooter}`}>
    //                 <div
    //                     className={`${styles.slideTabActiveBar}`}
    //                     style={item.color ? { background: item.color } : {}}
    //                 ></div>
    //             </div>
    //         </div>
    //     );
    // }

    /**
     * Update worksheet info.
     *
     * This method could be triggered when
     */
    private _updateSheetBarStatus(): void {
        const injector = this.context.injector!;
        const currentUniverService = injector.get(ICurrentUniverService);
        const commandService = injector.get(ICommandService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const sheets = workbook.getSheets();

        const worksheetMenuItems = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: `${index}`,
            sheetId: sheet.getSheetId(),
            hide: sheet.isSheetHidden() === BooleanNumber.TRUE,
            selected: sheet.getStatus() === BooleanNumber.TRUE,
            onClick: (e?: MouseEvent) => {
                const worksheetId = sheet.getSheetId();
                commandService.executeCommand(SetWorksheetShowCommand.id, {
                    workbookId: workbook.getUnitId(),
                    worksheetId,
                });
            },
        }));

        const sheetListItems = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                index: `${index}`,
                selected: sheet.getStatus() === BooleanNumber.TRUE,
                color: (sheet.getTabColor() as string) ?? undefined,
                onMouseDown: (e: MouseEvent) => {
                    const worksheetId = sheet.getSheetId();

                    commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        workbookId: workbook.getUnitId(),
                        worksheetId,
                    });
                },
            }));

        // TODO: update state to the component, including active sheet index

        this.setState({
            menuList: worksheetMenuItems,
            sheetList: sheetListItems,
        });
    }

    /**
     * When specific command executed, update the status of sheet bar.
     * @returns disposable
     */
    private _setupStatusUpdate(): IDisposable {
        const commandService = this.context.injector.get(ICommandService);
        return commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SetTabColorMutation.id:
                case SetWorksheetHideMutation.id:
                case RemoveSheetMutation.id:
                case SetWorksheetNameMutation.id:
                case InsertSheetMutation.id:
                case SetWorksheetOrderMutation.id:
                case SetWorksheetActivateMutation.id:
                    this._updateSheetBarStatus();
                    break;
                default:
                    break;
            }
        });
    }

    override render() {
        const { sheetList, menuList, sheetUl, showMenu, menuStyle, draggable } = this.state;

        const { addSheet } = this.props;

        return (
            <div className={styles.sheetBar}>
                <div className={styles.sheetBarOptions}>
                    {/* add sheet button */}
                    <Button className={styles.sheetBarOptionsButton} onClick={addSheet}>
                        <Icon.Math.AddIcon style={{ fontSize: '20px' }} />
                    </Button>
                    {/* all sheets button */}
                    <Button
                        className={styles.sheetBarOptionsButton}
                        onClick={(e: MouseEvent) => this.ref.current?.showMenu(true)}
                    >
                        <Icon.MenuIcon style={{ fontSize: '20px' }} />
                        <SheetBarMenu menu={menuList as ISheetBarMenuItem[]}></SheetBarMenu>
                    </Button>
                </div>

                {/* user s button */}
                {/* <Tabs draggable className={styles.slideTabBar}>
                    {sheetList.map((item) => (
                        <TabPane
                            key={item.sheetId}
                            keys={item.sheetId}
                            label={this.getSheetBarItem(item)}
                            className={styles.sheetBarTabPane}
                        ></TabPane>
                    ))}
                </Tabs> */}
                <div className={styles.slideTabBar}>
                    {sheetList.map((item) => (
                        <div
                            onMouseDown={item.onMouseDown}
                            onContextMenu={this.contextMenu}
                            key={item.sheetId}
                            data-id={item.sheetId}
                            className={`${styles.slideTabItem} ${item.selected ? styles.slideTabActive : ''}`}
                        >
                            <div className={`${styles.slideTabContent}`}>
                                <div className={`${styles.slideTabDivider}`}></div>
                                <div className={`${styles.slideTabTitle}`}>
                                    <span className={`${styles.slideTabSpan}`} style={{ padding: '2px 5px 2px 5px' }}>
                                        <CustomLabel label={item.label} />
                                    </span>
                                </div>
                                <div
                                    className={`${styles.slideTabIcon}`}
                                    data-slide-skip="true"
                                    style={{ lineHeight: 1 }}
                                    data-id={item.sheetId}
                                    onClick={(e) => this.onContextMenuClick(e)}
                                >
                                    <Icon.NextIcon />
                                </div>
                            </div>
                            <div className={`${styles.slideTabFooter}`}>
                                <div
                                    className={`${styles.slideTabActiveBar}`}
                                    style={item.color ? { background: item.color } : {}}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* context menu */}
                <Menu
                    className={styles.sheetUl}
                    menu={sheetUl}
                    menuId={MenuPosition.SHEET_BAR}
                    show={showMenu}
                    style={menuStyle}
                    onOptionSelect={(params) => {
                        const { label: commandId } = params;
                        const commandService: ICommandService = (this.context as IKeyValue).injector.get(
                            ICommandService
                        );
                        commandService.executeCommand(commandId as string);
                    }}
                />

                {/* prev next scroll button */}
                <div className={`${styles.sheetBarOptions} ${styles.sheetBarScrollButton}`}>
                    <Button className={styles.sheetBarOptionsButton} onClick={this.scrollLeft}>
                        <Icon.NextIcon rotate={90} style={{ padding: '5px' }} />
                    </Button>
                    <Button className={styles.sheetBarOptionsButton} onClick={this.scrollRight}>
                        <Icon.NextIcon rotate={-90} style={{ padding: '5px' }} />
                    </Button>
                </div>
            </div>
        );
    }
}
