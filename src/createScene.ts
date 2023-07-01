type Engine = import("@babylonjs/core/Engines/engine").Engine;
type Scene = import("@babylonjs/core/scene").Scene;
import * as logic from "my-logic";

export interface CreateSceneClass {
    createScene: (engine: Engine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

export const getSceneModuleWithName = (
    // name = 'defaultWithTexture'
    // name = 'navigationMeshRecast'
    // name = 'loadModelAndEnv'
    // name = 'physicsWithAmmo'
    // name = 'testMeshes'
    // name = 'pirateFort'
    name = 'abbitt'

): Promise<CreateSceneClass> => {
    console.log("============ " + logic.Title);
    return import('./scenes/' + name).then((module: CreateSceneModule)=> {
        return module.default;
    });

    // To build quicker, replace the above return statement with:

    // return import('./scenes/defaultWithTexture').then((module: CreateSceneModule)=> {
    //     return module.default;
    // });
};

