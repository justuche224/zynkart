"use client";

import Image from "next/image";
import React from "react";
import styled from "styled-components";

const Hero = () => {
  return (
    <StyledWrapper>
      <div className="futuristic-pattern">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-white text-4xl font-bold text-center">
            <div>Zynkart</div>
            <div>
              {`All-in-one platform to build, manage, and scale your business online`}
            </div>
          </div>
          <Image
            src={"/images/—Pngtree—daily shopping cart_5398373.png"}
            width={500}
            height={500}
            alt="shopping"
          />
        </div>

        <span className="ripple-overlay" />
        <svg className="texture-filter">
          <filter id="advanced-texture">
            <feTurbulence
              result="noise"
              numOctaves={3}
              baseFrequency="0.7"
              type="fractalNoise"
            />
            <feSpecularLighting
              result="specular"
              lightingColor="#fff"
              specularExponent={20}
              specularConstant="0.8"
              surfaceScale={2}
              in="noise"
            >
              <fePointLight z={100} y={50} x={50} />
            </feSpecularLighting>
            <feComposite
              result="litNoise"
              operator="in"
              in2="SourceGraphic"
              in="specular"
            />
            <feBlend mode="overlay" in2="litNoise" in="SourceGraphic" />
          </filter>
        </svg>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .futuristic-pattern {
    width: 100%;
    height: 100svh;
    background: linear-gradient(
      145deg,
      oklch(0.56 0.15 49),
      oklch(0.5 0.13 45),
      oklch(0.44 0.12 40)
    );
    filter: url(#advanced-texture);
  }
`;

export default Hero;
