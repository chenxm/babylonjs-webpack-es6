import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreateTiledBox } from "@babylonjs/core/Meshes/Builders/tiledBoxBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { CreateGeodesic } from "@babylonjs/core/Meshes/Builders/geodesicBuilder";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateCapsule } from "@babylonjs/core/Meshes/Builders/capsuleBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateDisc } from "@babylonjs/core/Meshes/Builders/discBuilder";
import { CreateGoldberg } from "@babylonjs/core/Meshes/Builders/goldbergBuilder";
import { CreateDecal } from "@babylonjs/core/Meshes/Builders/decalBuilder";
import { CreateIcoSphere } from "@babylonjs/core/Meshes/Builders/icoSphereBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { CreatePolygon } from "@babylonjs/core/Meshes/Builders/polygonBuilder";
import { CreatePolyhedron } from "@babylonjs/core/Meshes/Builders/polyhedronBuilder";
import { CreateLathe } from "@babylonjs/core/Meshes/Builders/latheBuilder";
import { CreateRibbon } from "@babylonjs/core/Meshes/Builders/ribbonBuilder";
import { CreateTiledPlane } from "@babylonjs/core/Meshes/Builders/tiledPlaneBuilder";
import { CreateTorus } from "@babylonjs/core/Meshes/Builders/torusBuilder";
import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { CreateTorusKnot } from "@babylonjs/core/Meshes/Builders/torusKnotBuilder";
import { CreateHemisphere } from "@babylonjs/core/Meshes/Builders/hemisphereBuilder";

export class TestMeshes implements CreateSceneClass {
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        void Promise.all([
            import("@babylonjs/core/Debug/debugLayer"),
            import("@babylonjs/inspector"),
        ]).then((_values) => {
            console.log(_values);
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
                globalRoot: document.getElementById("#root") || undefined,
            });
        });

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "my first camera",
            0,
            Math.PI / 3,
            10,
            new Vector3(0, 0, 0),
            scene
        );

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // const light = new HemisphericLight(
        //     "light",
        //     new Vector3(0, 1, 0),
        //     scene
        // );

        // // Default intensity is 1. Let's dim the light a small amount
        // light.intensity = 0.7;

        const box = CreateBox("box", {});

        const capsule = CreateCapsule("capsule", {});

        const cylinder = CreateCylinder("cylinder", {});

        const disc = CreateDisc("disc", {});

        const goldberg = CreateGoldberg("goldberg", {});

        // CreateDecal("decal", {});

        CreateIcoSphere("ico sphere", {});

        CreatePlane("plane", {});

        // CreatePolygon("polygon", { shape: [new Vector3(3,3,3), new Vector3(1,3,3), new Vector3(3,1,3), new Vector3(3,3,1), new Vector3(1,1,3)]});

        CreatePolyhedron("polyhedron", {});

        CreateLathe("lathe", { shape: [new Vector3(3,3,3), new Vector3(1,3,3), new Vector3(3,1,3), new Vector3(3,3,1), new Vector3(1,1,3)]});

        // CreateRibbon("ribbon", { pathArray: []});

        CreateTiledPlane("tiled plane", {});

        CreateTorus("torus", {});

        CreateTorusKnot("torus knot", {});

        CreateTube("tube", { path: [new Vector3(3,3,3), new Vector3(1,3,3), new Vector3(3,1,3), new Vector3(3,3,1), new Vector3(1,1,3)]});

        CreateHemisphere("hemisphere", {});

        const geodesic = CreateGeodesic("geodesic", {});

        const tiledBox = CreateTiledBox("tiled box", {});
        tiledBox.position.x = 2;

        // Our built-in 'sphere' shape.
        const sphere = CreateSphere(
            "sphere",
            { diameter: 0.2, segments: 32 },
            scene
        );

        // Move the sphere upward 1/2 its height
        sphere.position.y = 0.1;

        // Our built-in 'ground' shape.
        const ground = CreateGround(
            "ground",
            { width: 6, height: 6 },
            scene
        );

        // Load a texture to be used as the ground material
        const groundMaterial = new StandardMaterial("ground material", scene);
        groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);

        ground.material = groundMaterial;
        ground.receiveShadows = true;

        const light = new DirectionalLight(
            "light",
            new Vector3(0, -1, 1),
            scene
        );
        light.intensity = 0.5;
        light.position.y = 10;

        const shadowGenerator = new ShadowGenerator(512, light)
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.2);

        shadowGenerator.getShadowMap()!.renderList!.push(sphere);

        return scene;
    };
}

export default new TestMeshes();
