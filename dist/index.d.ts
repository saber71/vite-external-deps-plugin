import { Plugin } from 'vite';

/**
 * 创建一个处理外部依赖的Vite插件。
 *
 * 该插件自动识别并外部化包的dependencies和peerDependencies，
 * 并允许通过配置包含或排除特定的依赖。
 *
 * @param options 外部依赖的配置选项。
 * @returns 返回一个Vite插件实例。
 */
export declare function externalDepsPlugin(options?: ExternalOptions): Plugin;

/**
 * 外部依赖插件选项接口。
 *
 * 提供配置外部依赖的选项，包括排除、包含和根目录设置。
 */
export declare interface ExternalOptions {
    exclude?: string[];
    include?: string[];
    root?: string;
}

export { }
