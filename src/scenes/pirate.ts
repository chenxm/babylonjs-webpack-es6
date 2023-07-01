import * as BABYLON from "@babylonjs/core";

import "@babylonjs/core/Physics/physicsEngineComponent";
import { ammoModule, ammoReadyPromise } from "../externals/ammo";
import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";


import { CreateSceneClass } from "../createScene";

export class PirateScene implements CreateSceneClass {

    preTasks = [ammoReadyPromise];

    createScene = async (
        engine: BABYLON.Engine,
        canvas: HTMLCanvasElement
    ): Promise<BABYLON.Scene> => {

        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(engine);

        scene.clearColor = new BABYLON.Color4(0.31, 0.48, 0.64, 1);

        //add an arcRotateCamera to the scene
        var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(125), BABYLON.Tools.ToRadians(70), 25, new BABYLON.Vector3(0, 3, 0), scene);
        camera.lowerRadiusLimit = 10;
        //camera.upperRadiusLimit = 40;

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        //enable physics in the scene
        scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.AmmoJSPlugin(true, ammoModule));

        //array for holding the cannon and "paired" animation group
        const cannonAnimationPairings: { [key: string]: any } = {};

        //array for holding readyToPlay status for the cannons
        const cannonReadyToPlay: { [key: string]: any } = {};

        //create a cannonBall template to clone from, set it's visibility to off.
        var cannonBall = BABYLON.MeshBuilder.CreateSphere("cannonBall", { diameter: 0.3 }, scene);
        var cannonBallMat = new BABYLON.StandardMaterial("cannonBallMaterial", scene);
        cannonBallMat.diffuseColor = BABYLON.Color3.Black();
        cannonBallMat.specularPower = 256;
        cannonBall.material = cannonBallMat;
        cannonBall.isVisible = false;

        //create a large box far underneath the tower, that will act as a trigger to destroy the cannonballs.
        var killBox = BABYLON.MeshBuilder.CreateBox("killBox", { width: 400, depth: 400, height: 4 }, scene);
        killBox.position = new BABYLON.Vector3(0, -50, 0);
        killBox.visibility = 0;

        //Load the tower assets
        // const pirateFortImport = await BABYLON.SceneLoader.ImportMeshAsync("", "https://models.babylonjs.com/pirateFort/", "pirateFort.glb", scene);
        const pirateFortImport = await BABYLON.SceneLoader.ImportMeshAsync("", "./", "pirateFort.glb", scene);
        pirateFortImport.meshes[0].name = "pirateFort"
        const material = scene.getMeshByName("sea")?.material;
        material && (material.needDepthPrePass = true);
        const light = scene.getLightByName("Sun");
        light && (light.intensity = 12);

        //Load the cannon model and create clones
        const cannonImportResult = await BABYLON.SceneLoader.ImportMeshAsync("", "https://models.babylonjs.com/pirateFort/", "cannon.glb", scene);
        //remove the top level root node
        let cannon = cannonImportResult.meshes[0].getChildren()[0] as BABYLON.TransformNode;
        if (!cannon) {
            throw new Error("no cannon");
        }
        cannon && (cannon.parent = null);
        cannonImportResult.meshes[0].dispose();

        //set the metadata of each mesh to filter on later
        var cannonMeshes = cannon.getChildMeshes();
        for (var i = 0; i < cannonMeshes.length; i++) {
            cannonMeshes[i].metadata = "cannon";
        }

        const importedAnimGroups = cannonImportResult.animationGroups;

        //loop through all imported animation groups and copy the animation curve data to an array.
        var animations = [];
        for (var i = 0; i < importedAnimGroups.length; i++) {
            importedAnimGroups[i].stop();
            animations.push(importedAnimGroups[i].targetedAnimations[0].animation);
            importedAnimGroups[i].dispose();
        }

        //create a new animation group and add targeted animations based on copied curve data from the "animations" array.
        var cannonAnimGroup = new BABYLON.AnimationGroup("cannonAnimGroup");
        cannonAnimGroup.addTargetedAnimation(animations[0], cannon.getChildMeshes()[1]);
        cannonAnimGroup.addTargetedAnimation(animations[1], cannon.getChildMeshes()[0]);

        //create a box for particle emission, position it at the muzzle of the cannon, turn off visibility and parent it to the cannon mesh
        var particleEmitter = BABYLON.MeshBuilder.CreateBox("particleEmitter", { size: 0.05 }, scene);
        particleEmitter.position = new BABYLON.Vector3(0, 0.76, 1.05);
        particleEmitter.rotation.x = BABYLON.Tools.ToRadians(78.5);
        particleEmitter.isVisible = false;
        particleEmitter.setParent(cannon.getChildMeshes()[1]);

        //load particle system from the snippet server and set the emitter to the particleEmitter. Set its stopDuration.
        const smokeBlast = await BABYLON.ParticleHelper.CreateFromSnippetAsync("LCBQ5Y#6", scene);
        smokeBlast.emitter = particleEmitter;
        smokeBlast.targetStopDuration = 0.2;

        //load a cannon blast sound
        var cannonBlastSound = new BABYLON.Sound("music", "https://assets.babylonjs.com/sound/cannonBlast.mp3", scene);

        //position and rotation data for the placement of the cannon clones
        var cannonPositionArray = [
            [new BABYLON.Vector3(0.97, 5.52, 1.79), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(1.08, 2.32, 3.05), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(1.46, 2.35, -0.73), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(1.45, 5.52, -1.66), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(1.49, 8.69, -0.35), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(-1.37, 8.69, -0.39), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(-90), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(0.58, 4, -2.18), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(180), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(1.22, 8.69, -2.5), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(180), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(-1.31, 2.33, -2.45), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(180), BABYLON.Tools.ToRadians(0))],
            [new BABYLON.Vector3(-3.54, 5.26, -2.12), new BABYLON.Vector3(BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(-90), BABYLON.Tools.ToRadians(0))]
        ];

        //create 10 cannon clones, each with unique position/rotation data. Note that particle systems are cloned with parent meshes
        //also create 10 new animation groups with targeted animations applied to the newly cloned meshes
        for (var i = 0; i < 10; i++) {
            let cannonClone = cannon.clone("cannonClone" + i, null) as BABYLON.TransformNode;
            if (!cannonClone) {
                continue;
            }
            cannonClone.position = cannonPositionArray[i][0];
            cannonClone.rotation = cannonPositionArray[i][1];
            var cannonAnimGroupClone = new BABYLON.AnimationGroup("cannonAnimGroupClone" + i);
            cannonAnimGroupClone.addTargetedAnimation(cannonAnimGroup.targetedAnimations[0].animation, cannonClone.getChildMeshes()[1]);
            cannonAnimGroupClone.addTargetedAnimation(cannonAnimGroup.targetedAnimations[1].animation, cannonClone.getChildMeshes()[0]);

            //store a key/value pair of each clone name and the name of the associated animation group name.
            cannonAnimationPairings[cannonClone.name] = cannonAnimGroupClone.name;

            //store key/value pair for the cannon name and it's readyToPlay status as 1;
            cannonReadyToPlay[cannonClone.name] = 1;

        }
        //dispose of the original cannon, animation group, and particle system
        cannon.dispose();
        cannonAnimGroup.dispose();
        smokeBlast.dispose();

        //create an array for all particle systems in the scene, loop through it and stop all systems from playing.
        var smokeBlasts = scene.particleSystems;
        for (var i = 0; i < smokeBlasts.length; i++) {
            smokeBlasts[i].stop();
        }

        //logic of what happens on a click
        scene.onPointerDown = function (evt, pickResult) {
            //check if a mesh was picked and if that mesh has specific metadata
            if (pickResult.pickedMesh && pickResult.pickedMesh.metadata === "cannon") {
                //find the top level parent (necessary since the cannon is an extra layer below the clone root)
                let topParent = pickResult.pickedMesh.parent;
                if (topParent && topParent.parent) {
                    topParent = topParent.parent;
                }
                if (!topParent) {
                    throw new Error("toParent error");
                }

                //wrap all 'play' elements into a check to make sure the cannon can be played.
                if (cannonReadyToPlay[topParent.name] === 1) {
                    //set the readyToPlay status to 0
                    cannonReadyToPlay[topParent.name] = 0;
                    //loop through all of the animation groups in the scene and play the correct group based on the top level parent of the picked mesh.
                    var animationToPlay = cannonAnimationPairings[topParent.name];
                    for (var i = 0; i < scene.animationGroups.length; i++) {
                        if (scene.animationGroups[i].name === animationToPlay) {
                            scene.animationGroups[i].play();
                            //after the animation has finished, set the readyToPlay status for this cannon to 1;
                            scene.animationGroups[i].onAnimationGroupEndObservable.addOnce(() => {
                                cannonReadyToPlay[topParent!.name] = 1;
                            });
                        }
                    }
                    //loop through all particle systems in the scene, loop through all picked mesh submeshes. if there is a matching mesh and particle system emitter, start the particle system.
                    var childMeshes = pickResult.pickedMesh.getChildMeshes();
                    for (var i = 0; i < smokeBlasts.length; i++) {
                        for (var j = 0; j < childMeshes.length; j++) {
                            if (childMeshes[j] === smokeBlasts[i].emitter) {
                                smokeBlasts[i].start();

                                //clone the cannonBall, make it visible, and add a physics imposter to it. Finally apply a force by scaling the up vector of the particle emitter box
                                var cannonBallClone = cannonBall.clone("cannonBallClone")
                                cannonBallClone.visibility = 1;
                                cannonBallClone.position = childMeshes[j].absolutePosition;
                                cannonBallClone.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBallClone, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 2, friction: 0.5, restitution: 0 }, scene);
                                cannonBallClone.physicsImpostor.applyImpulse(childMeshes[j].up.scale(40), BABYLON.Vector3.Zero());

                                //create an action manager for the cannonBallClone that will fire when intersecting the killbox. It will then dispose of the cannonBallClone.
                                cannonBallClone.actionManager = new BABYLON.ActionManager(scene);
                                cannonBallClone.actionManager.registerAction(
                                    new BABYLON.ExecuteCodeAction(
                                        {
                                            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                                            parameter: killBox
                                        },
                                        function () {
                                            cannonBallClone.dispose();
                                        }
                                    )
                                );
                            }
                        }
                    }
                    cannonBlastSound.play();
                }
            }
        };

        return scene;

    }
}


export default new PirateScene();