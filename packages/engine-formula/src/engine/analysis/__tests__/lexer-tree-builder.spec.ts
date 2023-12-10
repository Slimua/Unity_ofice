import { describe, expect, it } from 'vitest';

import type { LexerNode } from '../lexer-node';
import { LexerTreeBuilder } from '../lexer-tree-builder';

describe('lexer nodeMaker test', () => {
    const lexerTreeBuilder = new LexerTreeBuilder();

    describe('lexer', () => {
        it('lambda simple1', () => {
            const node = lexerTreeBuilder.treeBuilder(
                `=lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+1-max(100,200)`
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":0,"ed":5,"children":[{"token":"L_1","st":14,"ed":16,"children":[{"token":"P_1","st":15,"ed":17,"children":[{"token":"sum","st":19,"ed":21,"children":[{"token":"P_1","st":19,"ed":21,"children":["1"]},{"token":"P_1","st":21,"ed":23,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":30,"ed":32,"children":["2"]}]},{"token":"P_1","st":3,"ed":5,"children":["x"]},{"token":"P_1","st":5,"ed":7,"children":["y"]},{"token":"P_1","st":7,"ed":9,"children":[" x","y","x","*","*"]}]},"1",{"token":"max","st":39,"ed":41,"children":[{"token":"P_1","st":39,"ed":41,"children":["100"]},{"token":"P_1","st":43,"ed":45,"children":["200"]}]},"-","+"]}`
            );
        });

        it('lambda mixed2', () => {
            const node = lexerTreeBuilder.treeBuilder(
                `=(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect(A5):B10# + B6# + A1:offset(C5, 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) + sum((1+2%)*30%, 1+2)%`
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"-","st":1,"ed":1,"children":[{"token":"P_1","st":-1,"ed":1,"children":["1","2","+"]}]},{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B2 ","st":-1,"ed":-1,"children":[]}]}]}]}]}," 5","+","-","2 ","/",{"token":" -sum","st":24,"ed":28,"children":[{"token":"P_1","st":26,"ed":28,"children":[{"token":"#","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"indirect","st":30,"ed":37,"children":[{"token":"P_1","st":35,"ed":37,"children":["A5"]}]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"#","st":-1,"ed":-1,"children":[" B6"]},{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":" A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"offset","st":59,"ed":64,"children":[{"token":"P_1","st":62,"ed":64,"children":["C5"]},{"token":"P_1","st":65,"ed":67,"children":[" 1"]},{"token":"P_1","st":68,"ed":70,"children":[" 1"]}]}]}]}," +"," +"]},{"token":"P_1","st":74,"ed":76,"children":["  100"]}]}," {1,2,3;4,5,6;7,8,10}",{"token":" lambda","st":109,"ed":115,"children":[{"token":"L_1","st":126,"ed":128,"children":[{"token":"P_1","st":127,"ed":129,"children":[{"token":"sum","st":131,"ed":133,"children":[{"token":"P_1","st":131,"ed":133,"children":["1"]},{"token":"P_1","st":133,"ed":135,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":142,"ed":144,"children":["2"]},{"token":"P_1","st":144,"ed":146,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"lambda","st":148,"ed":153,"children":[{"token":"L_1","st":177,"ed":179,"children":[{"token":"P_1","st":178,"ed":180,"children":["1"]},{"token":"P_1","st":180,"ed":182,"children":["2"]}]},{"token":"P_1","st":151,"ed":153,"children":["x"]},{"token":"P_1","st":153,"ed":155,"children":["y"]},{"token":"P_1","st":155,"ed":157,"children":[{"token":" @offset","st":159,"ed":166,"children":[{"token":"P_1","st":164,"ed":166,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B0","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":170,"ed":172,"children":[{"token":"#","st":-1,"ed":-1,"children":["x"]},{"token":"#","st":-1,"ed":-1,"children":["y"]},"*"]}]}]}]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C20","st":-1,"ed":-1,"children":[]}]}]}]}]},{"token":"P_1","st":113,"ed":115,"children":["x"]},{"token":"P_1","st":115,"ed":117,"children":["y"]},{"token":"P_1","st":117,"ed":119,"children":["z"]},{"token":"P_1","st":119,"ed":121,"children":[" x","y","z","*","*"]}]},{"token":"%","st":-1,"ed":-1,"children":[{"token":" sum","st":193,"ed":196,"children":[{"token":"P_1","st":194,"ed":196,"children":["1",{"token":"%","st":-1,"ed":-1,"children":["2"]},"+",{"token":"%","st":-1,"ed":-1,"children":["30"]},"*"]},{"token":"P_1","st":205,"ed":207,"children":[" 1","2","+"]}]}]}," +"," +"," +","+"]}`
            );
        });

        it('normal', () => {
            const node = lexerTreeBuilder.treeBuilder(
                `=(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100`
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":1,"ed":3,"children":[{"token":"P_1","st":1,"ed":3,"children":[{"token":"max","st":5,"ed":7,"children":[{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":["10"]}]},"5","*","100","-"]},{"token":"P_1","st":22,"ed":24,"children":["1","1","+","2","*","5","+","2","/"]},{"token":"P_1","st":36,"ed":38,"children":["10"]}]},{"token":"count","st":44,"ed":48,"children":[{"token":"P_1","st":46,"ed":48,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":53,"ed":55,"children":["10","5","*","100","-"]}]},"+","5","*","100","-"]}`
            );
        });

        it('normal', () => {
            const node = lexerTreeBuilder.treeBuilder(
                `=(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10, lambda(x,y, x*y*x)(sum(1,(1+2)*3),2))+lambda(x,y, x*y*x)(sum(1,(1+2)*3),2)+count(B1:C10,10*5-100))*5-100`
            ) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"sum","st":1,"ed":3,"children":[{"token":"P_1","st":1,"ed":3,"children":[{"token":"max","st":5,"ed":7,"children":[{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":["10"]}]},"5","*","100","-"]},{"token":"P_1","st":22,"ed":24,"children":["1","1","+","2","*","5","+","2","/"]},{"token":"P_1","st":36,"ed":38,"children":["10"]},{"token":"P_1","st":39,"ed":41,"children":[{"token":" lambda","st":43,"ed":49,"children":[{"token":"L_1","st":58,"ed":60,"children":[{"token":"P_1","st":59,"ed":61,"children":[{"token":"sum","st":63,"ed":65,"children":[{"token":"P_1","st":63,"ed":65,"children":["1"]},{"token":"P_1","st":65,"ed":67,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":74,"ed":76,"children":["2"]}]},{"token":"P_1","st":47,"ed":49,"children":["x"]},{"token":"P_1","st":49,"ed":51,"children":["y"]},{"token":"P_1","st":51,"ed":53,"children":[" x","y","x","*","*"]}]}]}]},{"token":"lambda","st":82,"ed":87,"children":[{"token":"L_1","st":96,"ed":98,"children":[{"token":"P_1","st":97,"ed":99,"children":[{"token":"sum","st":101,"ed":103,"children":[{"token":"P_1","st":101,"ed":103,"children":["1"]},{"token":"P_1","st":103,"ed":105,"children":["1","2","+","3","*"]}]}]},{"token":"P_1","st":112,"ed":114,"children":["2"]}]},{"token":"P_1","st":85,"ed":87,"children":["x"]},{"token":"P_1","st":87,"ed":89,"children":["y"]},{"token":"P_1","st":89,"ed":91,"children":[" x","y","x","*","*"]}]},{"token":"count","st":119,"ed":123,"children":[{"token":"P_1","st":121,"ed":123,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C10","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":128,"ed":130,"children":["10","5","*","100","-"]}]},"+","+","5","*","100","-"]}`
            );
        });

        it('let', () => {
            const node = lexerTreeBuilder.treeBuilder(`=let(x,5,y,4,sum(x,y)+x)`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"let","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["x"]},{"token":"P_1","st":2,"ed":4,"children":["5"]},{"token":"P_1","st":4,"ed":6,"children":["y"]},{"token":"P_1","st":6,"ed":8,"children":["4"]},{"token":"P_1","st":8,"ed":10,"children":[{"token":"sum","st":12,"ed":14,"children":[{"token":"P_1","st":12,"ed":14,"children":["x"]},{"token":"P_1","st":14,"ed":16,"children":["y"]}]},"x","+"]}]}]}`
            );
        });

        it('REDUCE', () => {
            const node = lexerTreeBuilder.treeBuilder(`=REDUCE(1, A1:C2, LAMBDA(a,b,a+b^2))`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"REDUCE","st":0,"ed":5,"children":[{"token":"P_1","st":3,"ed":5,"children":["1"]},{"token":"P_1","st":5,"ed":7,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":" A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"C2","st":-1,"ed":-1,"children":[]}]}]}]},{"token":"P_1","st":12,"ed":14,"children":[{"token":" LAMBDA","st":16,"ed":22,"children":[{"token":"P_1","st":20,"ed":22,"children":["a"]},{"token":"P_1","st":22,"ed":24,"children":["b"]},{"token":"P_1","st":24,"ed":26,"children":["a","b","2","^","+"]}]}]}]}]}`
            );
        });

        it('missing default arguments', () => {
            const node = lexerTreeBuilder.treeBuilder(`=SUM(, A1:B1)`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":[]},{"token":"P_1","st":1,"ed":3,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":" A1","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B1","st":-1,"ed":-1,"children":[]}]}]}]}]}]}`
            );
        });

        it('negative and percentage', () => {
            const node = lexerTreeBuilder.treeBuilder(`=0.1 -- 0.2%`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":["0.1 ",{"token":"%","st":-1,"ed":-1,"children":["- 0.2"]},"-"]}`
            );
        });

        it('negative and percentage', () => {
            const node = lexerTreeBuilder.treeBuilder(`=1+(3*4=4)*5+1`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":["1","3","4","*","4","=","5","*","1","+","+"]}`
            );
        });

        it('prefixToken', () => {
            const node = lexerTreeBuilder.treeBuilder(`=  -@A4:B5`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"-","st":-1,"ed":-1,"children":[{"token":"@","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"A4","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B5","st":-1,"ed":-1,"children":[]}]}]}]}]}]}`
            );
        });

        it('table', () => {
            const node = lexerTreeBuilder.treeBuilder(`=SUM(Table3[[#All],[Column1]:[Column2]])`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":"SUM","st":0,"ed":2,"children":[{"token":"P_1","st":0,"ed":2,"children":["Table3[[#All],[Column1]:[Column2]]"]}]}]}`
            );
        });

        it('import range', () => {
            const node = lexerTreeBuilder.treeBuilder(`=[asdfasdfasdf]'sheet-1'!A3:B10`) as LexerNode;
            expect(JSON.stringify(node.serialize())).toStrictEqual(
                `{"token":"R_1","st":-1,"ed":-1,"children":[{"token":":","st":-1,"ed":-1,"children":[{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"[asdfasdfasdf]'sheet-1'!A3","st":-1,"ed":-1,"children":[]}]},{"token":"P_1","st":-1,"ed":-1,"children":[{"token":"B10","st":-1,"ed":-1,"children":[]}]}]}]}`
            );
        });

        it('nodeMaker performance', () => {
            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                lexerTreeBuilder.nodeMakerTest(
                    `=(-(1+2)--@A1:B2 + 5)/2 + -sum(indirect(A5):B10# + B6# + A1:offset(C5, 1, 1)  ,  100) + {1,2,3;4,5,6;7,8,10} + lambda(x,y,z, x*y*z)(sum(1,(1+2)*3),2,lambda(x,y, @offset(A1:B0,x#*y#))(1,2):C20) + sum((1+2%)*30%, 1+2)%`
                );
            }
            const end = performance.now();
            const elapsed = end - start; // 毫秒数

            console.log(`Elapsed time: ${elapsed} ms`);

            const expectedMaxTime = 3000; // 毫秒数
            expect(elapsed).toBeLessThan(expectedMaxTime);
        });
    });
});
