import { CommandType, ICommandService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Observable } from 'rxjs';

export class RecordController {
    constructor(@Inject(ICommandService) private _commandService: ICommandService) {}

    record() {
        return new Observable<{ type: 'start' } | { type: 'finish'; data: Blob }>((subscribe) => {
            navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
                subscribe.next({ type: 'start' });
                const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
                    ? 'video/webm; codecs=vp9'
                    : 'video/webm';
                const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

                const chunks: Blob[] = [];
                mediaRecorder.addEventListener('dataavailable', function (e) {
                    chunks.push(e.data);
                });

                mediaRecorder.addEventListener('stop', function () {
                    const blob = new Blob(chunks, { type: chunks[0].type });
                    subscribe.next({ type: 'finish', data: blob });
                    subscribe.complete();
                });

                mediaRecorder.start();
            });
        });
    }

    startSaveCommands() {
        type SecondsString = string & {};
        type CommandString = string & {};
        type TypeString = string & {};
        type ParamsString = string & {};
        const result: Array<[SecondsString, CommandString, TypeString, ParamsString]> = [];
        const startTime = performance.now();
        const disposable = this._commandService.onCommandExecuted((commandInfo) => {
            try {
                result.push([
                    String((performance.now() - startTime) / 1000),
                    commandInfo.id,
                    String(commandInfo.type || CommandType.COMMAND),
                    JSON.stringify(commandInfo.params || ''),
                ]);
            } catch (err) {
                console.error(`${commandInfo.id}  unable to serialize`);
            }
        });
        return () => {
            disposable.dispose();
            return result;
        };
    }
}
