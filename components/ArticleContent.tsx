// components/ArticleContent.tsx
import React, { useCallback, useMemo, type FC } from 'react';
import {
  useWindowDimensions,
  Linking,
  View,
  Text,
  useColorScheme,
  ScrollView,
  type GestureResponderEvent,
} from 'react-native';
import RenderHTML, {
  type TNode,
  type TText,
  type CustomMixedRenderer,
  type CustomBlockRenderer,
  HTMLContentModel,
  HTMLElementModel,
  type MixedStyleDeclaration,
} from 'react-native-render-html';
import type { Element as DOMElement } from 'domhandler';
import WebView from 'react-native-webview';
import colors from 'tailwindcss/colors';
import { CTAButton } from './CTAButton';

interface ArticleContentProps {
  content: string;
  onInternalLinkPress?: (url: string, className?: string) => void;
}

const isTextTNode = (node: TNode): node is TText =>
  typeof (node as TText).data === 'string';

const extractText = (node: TNode): string => {
  if (isTextTNode(node)) return node.data;
  if (node.children?.length) {
    return node.children.map(extractText).join('');
  }
  return '';
};

const ArticleContent: FC<ArticleContentProps> = ({ content, onInternalLinkPress }) => {
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = screenWidth - 32;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const customHTMLElementModels = useMemo(
    () => ({
      iframe: HTMLElementModel.fromCustomModel({
        tagName: 'iframe',
        contentModel: HTMLContentModel.block,
        isVoid: false,
        isOpaque: false,
      }),
      center: HTMLElementModel.fromCustomModel({
        tagName: 'center',
        contentModel: HTMLContentModel.block,
      }),
    }),
    [],
  );

  const themeColors = useMemo(
    () => ({
      text: isDark ? colors.zinc[100] : colors.zinc[900],
      link: isDark ? colors.amber[400] : colors.amber[500],
      blockquoteBorder: colors.amber[400],
      blockquoteText: isDark ? colors.zinc[300] : colors.zinc[600],
    }),
    [isDark],
  );

  const tagsStyles = useMemo(
    () => ({
      h1: { fontSize: 32, fontWeight: 'bold', marginVertical: 8, color: themeColors.text },
      h2: { fontSize: 28, fontWeight: 'bold', marginVertical: 8, color: themeColors.text },
      h3: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, color: themeColors.text },
      h4: { fontSize: 20, fontWeight: 'bold', marginVertical: 8, color: themeColors.text },
      p: { fontSize: 18, marginVertical: 4, lineHeight: 24, color: themeColors.text },
      a: { 
        color: themeColors.link, 
        textDecorationColor: themeColors.link, 
        textDecorationLine: 'underline' 
      },
      blockquote: {
        fontStyle: 'italic',
        marginVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderLeftWidth: 4,
        borderLeftColor: themeColors.blockquoteBorder,
        color: themeColors.blockquoteText,
      },
      img: {
        width: '100%',
        height: undefined,
        alignSelf: 'center',
        marginVertical: 8,
        borderRadius: 8,
      },
      figure: { marginVertical: 8, alignSelf: 'center' },
      figcaption: {
        fontSize: 14,
        color: themeColors.blockquoteText,
        textAlign: 'center',
        marginTop: 4,
      },
      ul: { color: themeColors.text, marginLeft: 16 },
      ol: { color: themeColors.text, marginLeft: 16 },
      li: { color: themeColors.text, marginVertical: 2 },
      table: {
        borderWidth: 0.5,
        borderColor: 'lightgray',
        borderStyle: 'solid',
        width: 'auto',
        alignSelf: 'flex-start',
        marginVertical: 8,
        borderRadius: 4,
        overflow: 'hidden',
      },
      th: {
        borderWidth: 0.5,
        borderColor: 'lightgray',
        borderStyle: 'solid',
        padding: 8,
        width: 150,
      },
      td: {
        borderWidth: 0.5,
        borderColor: 'lightgray',
        borderStyle: 'solid',
        padding: 8,
        width: 150,
      },
    } as Record<string, MixedStyleDeclaration>),
    [themeColors],
  );

  const YouTubeIframeRenderer: CustomBlockRenderer = ({ tnode }) => {
    const src = tnode.attributes?.src;
    if (!src) return null;
    
    const isYouTube = src.includes('youtube.com/embed') || src.includes('youtu.be');
    if (!isYouTube) return null;
    
    const uri = src.startsWith('//') ? `https:${src}` : src;
    const videoHeight = (contentWidth * 9) / 16;
    
    return (
      <WebView
        source={{ uri }}
        style={{ width: contentWidth, height: videoHeight, marginVertical: 8 }}
        allowsFullscreenVideo
        javaScriptEnabled
        scalesPageToFit
      />
    );
  };

  const SimpleTableRenderer: CustomBlockRenderer = ({ tnode, TDefaultRenderer, ...props }) => (
    <ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ borderRadius: 4, overflow: 'hidden' }}>
        <TDefaultRenderer tnode={tnode} {...props} />
      </View>
    </ScrollView>
  );

  const handleLinkPress = useCallback(
    async (event: GestureResponderEvent, href?: string) => {
      if (!href) return;
      
      if (href.includes('cryptoast.fr') && !href.includes('/go-') && !href.includes('/cours-')) {
        onInternalLinkPress?.(href);
      } else {
        await Linking.openURL(href);
      }
    },
    [onInternalLinkPress],
  );

  const CustomAnchorRenderer: CustomMixedRenderer = ({ tnode, TDefaultRenderer, ...props }) => {
    if (tnode.classes?.includes('btn4')) {
      let gradientColors: readonly [string, string, ...string[]] = ['#000000', '#000000'];
      let buttonText = '';
      
      if (tnode.children?.length) {
        const spanNode = tnode.children.find(child => child.tagName === 'span');
        if (spanNode) {
          const styleAttr = spanNode.attributes?.style;
          if (styleAttr) {
            const regex = /linear-gradient\(to right,\s*(#[0-9A-Fa-f]{6}),\s*(#[0-9A-Fa-f]{6})\)/;
            const match = regex.exec(styleAttr);
            if (match) {
              gradientColors = [match[1], match[2]];
            }
          }
          buttonText = extractText(spanNode);
        }
      }
      
      const href = tnode.attributes?.href || '';
      return <CTAButton gradientColors={gradientColors} text={buttonText} href={href} />;
    }

    const href = tnode.attributes?.href;
    return (
      <TDefaultRenderer
        tnode={tnode}
        {...props}
        onPress={(e) => handleLinkPress(e, href)}
      />
    );
  };

  const CustomDivRenderer: CustomBlockRenderer = ({ tnode, TDefaultRenderer, ...props }) => {
    if (tnode.classes?.includes('blcatt')) {
      const adText = tnode.children ? tnode.children.map(extractText).join('') : '';
      return (
        <Text style={{ fontSize: 12, color: 'grey', textAlign: 'center', marginVertical: 4 }}>
          {adText}
        </Text>
      );
    }
    return <TDefaultRenderer tnode={tnode} {...props} />;
  };

  const renderersProps = useMemo(
    () => ({
      img: {
        enableExperimentalPercentWidth: true,
        initialDimensions: { width: contentWidth, height: 200 },
      },
      a: { onPress: handleLinkPress },
    }),
    [handleLinkPress, contentWidth],
  );

  const customRenderers = {
    a: CustomAnchorRenderer,
    div: CustomDivRenderer,
    iframe: YouTubeIframeRenderer,
    table: SimpleTableRenderer,
  };

  return (
    <View style={{ flex: 1 }}>
      <RenderHTML
        contentWidth={contentWidth}
        source={{ html: content }}
        domVisitors={{
          onElement: (element: DOMElement) => {
            if (
              element.tagName === 'blockquote' &&
              element.attribs?.class?.includes('article-blockquote-module')
            ) {
              if (element.children) {
                element.children = element.children.filter((child) => {
                  if ('tagName' in child && (child as DOMElement).tagName === 'img') {
                    return false;
                  }
                  if ('data' in child && typeof child.data === 'string') {
                    return !/^\s*$/.test(child.data);
                  }
                  return true;
                });

                if (!element.attribs.style) element.attribs.style = '';
                element.attribs.style += 'margin-top: 16px; margin-bottom: 16px; padding-top: 0;';
              }
            }

            if (element.tagName === 'img') {
              element.attribs = {
                ...element.attribs,
                width: '100%',
                height: '',
              };
            }
          },
        }}
        customHTMLElementModels={customHTMLElementModels}
        enableExperimentalBRCollapsing
        enableExperimentalGhostLinesPrevention
        renderers={customRenderers}
        renderersProps={renderersProps}
        baseStyle={{ color: themeColors.text, fontSize: 18 }}
        tagsStyles={tagsStyles}
      />
    </View>
  );
};

export default ArticleContent;