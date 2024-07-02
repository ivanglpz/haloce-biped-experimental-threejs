import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { FBXLoader, OrbitControls } from "three/examples/jsm/Addons.js";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xbababa);
      const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Luz ambiental
      scene.add(ambientLight);

      // Agregar luz ambiental

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 1, 0);

      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load("cyborg.jpg");
      const normalMap = textureLoader.load("/normal4.png");
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        "/cyborg.fbx",
        (object) => {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: texture,
                normalMap: normalMap,
                metalness: 0,
                roughness: 1,
              });
              child.castShadow = true; // Activa sombras emitidas por el modelo
              child.receiveShadow = true;
            }
          });
          scene.add(object);

          // Leer las coordenadas del modelo y ajustar la cámara
          const boundingBox = new THREE.Box3().setFromObject(object);
          const center = boundingBox.getCenter(new THREE.Vector3());
          const size = boundingBox.getSize(new THREE.Vector3());

          // Posicionar la cámara para que mire hacia el centro del modelo
          const distance = Math.max(size.x, size.y, size.z);
          const offset = new THREE.Vector3(25, 10, 0)
            .normalize()
            .multiplyScalar(distance);
          camera.position.copy(center).add(offset);
          controls.target.copy(center);
          controls.update();
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
          console.log(error);
        }
      );

      // INIT HEMISPHERE LIGHT
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      // SCENE
      scene.background = new THREE.Color(0xffffff);

      // FLOOR
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500, 32),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      scene.add(plane);

      const animate = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        controls.update();
      };
      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        containerRef.current?.removeChild(renderer.domElement);
      };
    }
  }, []);

  return <div ref={containerRef} />;
};

export default ThreeScene;
