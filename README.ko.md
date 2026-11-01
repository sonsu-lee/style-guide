# style-guide

[English](README.md) | 한국어 | [日本語](README.ja.md)

린트·포매터 공용 설정과 커스텀 린트 규칙을 모아 둔 저장소입니다.

제가 JavaScript·TypeScript 프로젝트에서 쓰는 Oxlint 프리셋과 커스텀 규칙을 npm 패키지로 배포합니다.

## 특징

- **빠릅니다.** 내장 규칙은 타입 정보가 필요한 규칙(tsgolint)까지 Oxlint가 실행합니다. ESLint는 Oxlint로 실행할 수 없는 규칙에만 씁니다.
- **함수 하나로 설정합니다.** `preset()`이 Oxlint 설정 전체를 만들어 줍니다. Oxlint의 `extends`로는 넘어가지 않는 ignore 패턴과 설정도 들어 있습니다.
- **포매팅은 하지 않습니다.** 포매팅은 oxfmt가 맡기 때문에 린트 프리셋과 포매터가 서로 부딪히지 않습니다.

## 시작하기

```sh
pnpm add -D oxlint oxlint-tsgolint @sonsu-lee/oxlint-config
```

```ts
// oxlint.config.ts
import { preset } from '@sonsu-lee/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig(preset({ node: true }, { rules: { 'no-console': 'off' } }));
```

TypeScript와 타입 정보가 필요한 규칙이 기본으로 켜지며, 이 규칙에는 `oxlint-tsgolint`가 필요합니다. JavaScript 프로젝트에서는 `typescript: false`를 넘깁니다.

| 패키지 | 설명 |
| --- | --- |
| [`@sonsu-lee/oxlint-config`](packages/oxlint-config) | Oxlint 프리셋을 만드는 factory 함수 |
| [`@sonsu-lee/oxlint-plugin`](packages/oxlint-plugin) | Oxlint가 JS 플러그인으로 실행하는 커스텀 규칙 |

패키지 구조는 [ARCHITECTURE.md](ARCHITECTURE.md)(영어)에, 설계를 이렇게 정한 이유는 [docs/decisions](docs/decisions)(영어)에 있습니다.

## 문의

[GitHub Issues](https://github.com/sonsu-lee/style-guide/issues)에 이슈를 등록해 주세요.

## 메인테이너와 기여

[@sonsu-lee](https://github.com/sonsu-lee)가 관리합니다. 개인 설정이라 제안은 언제든 환영하지만, 의도한 스타일을 바꾸는 PR은 받지 않을 수 있습니다. 개발 환경과 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)(영어)를 참고하세요.

## 라이선스

[MIT](LICENSE) © Sonsu Lee
