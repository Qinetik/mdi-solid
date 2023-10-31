const generate = require('./generate');

function gen(publishDir, target, distDir) {
    generate(publishDir, target, component => `const ${component.name} = ({ color = 'currentColor', size = 24, children, ...props }) => {
  return (
    <Dynamic component={"svg"} {...props} width={size} height={size} fill={color} viewBox="0 0 24 24">
        <Dynamic component={"path"} d="${component.svgPath}" />
    </Dynamic>
  );
};

export default ${component.name};
`, component => `import {MdiIconComponentType} from "./typings";

declare const ${component.name}: MdiIconComponentType;
export = ${component.name};
`, () => `import {Component, JSX} from "solid-js";

type AllSVGProps = JSX.SvgSVGAttributes<SVGSVGElement>

type ReservedProps = 'color' | 'size' | 'width' | 'height' | 'fill' | 'viewBox'

export interface MdiIconProps extends Pick<AllSVGProps, Exclude<keyof AllSVGProps, ReservedProps>> {
  color?: string;
  size?: number | string;
  // should not have any children
  children?: never;
}
export type MdiIconComponentType = Component<MdiIconProps>;
`, distDir).catch(err => console.error(err));

}

gen("publish-solid", "solid", "")