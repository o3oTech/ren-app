import { Stage, Container, Text, Graphics, Sprite } from "@inlet/react-pixi";
import * as PIXI from "pixi.js";
import React, { useState, useEffect, useRef } from "react";
import {
  ZhiEnum,
  GanEnum,
  NobleEnum,
  NobleXEnum,
  QiGongEnum,
  RefEnum,
  Xuns,
  NobleSlim,
} from "./invariant";
import { Lunar, Solar } from "lunar-javascript";
import { Stem, Branch } from "fortel-codex";
import jsonData from "./SQLite.json";
import { NavBar, Icon } from "antd-mobile";
import { useLocation, useHistory } from "react-router-dom";
import ImgFemale from "./assets/ace_female.png";
import ImgMale from "./assets/ace_male.png";
import moment from "moment";
import { Loading } from "zhui";
import { saveAs } from "file-saver";

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);

const getXingNian = (Ymd, gender) => {
  const date = new Date(Ymd);
  const diff = now.getFullYear() - date.getFullYear();
  const $date = Lunar.fromDate(date);
  const $now = Lunar.fromDate(now);
  const dateLiChunYmd = $date.getJieQiTable()["立春"].toYmd();
  const nowLiChunYmd = $now.getJieQiTable()["立春"].toYmd();
  const startDiff = Number(moment(date).isAfter(moment(dateLiChunYmd)));
  const endDiff = Number(moment(now).isAfter(moment(nowLiChunYmd)));

  const $diff = diff - startDiff + endDiff;

  if (Number(gender) === 1) {
    const ganValue = (3 + $diff) % 10 || 10;
    const gan = GanEnum[ganValue];
    const zhiValue = (3 + $diff) % 12 || 12;
    const zhi = ZhiEnum[zhiValue];
    return gan + zhi;
  } else {
    const ganGap = 9 - ($diff % 10);
    const ganValue = ganGap > 0 ? ganGap : 10 + ganGap;
    const zhiGap = 9 - ($diff % 12);
    const zhiValue = zhiGap > 0 ? zhiGap : 12 + zhiGap;
    const gan = GanEnum[ganValue];
    const zhi = ZhiEnum[zhiValue];
    return gan + zhi;
  }
};

const getNianMing = (Ymd) => {
  const date = new Date(Ymd);
  return Lunar.fromDate(date).getYearInGanZhiByLiChun();
};

const Nav = () => {
  const history = useHistory();
  return (
    <NavBar
      mode="light"
      icon={<Icon type="left" />}
      onLeftClick={() => history.push("/")}
      // rightContent={[
      //   <Icon key="1" type="ellipsis" />,
      // ]}
    >
      六壬排盘 ren.o3o.tech
    </NavBar>
  );
};

const style = new PIXI.TextStyle({
  // fontFamily: "Arial",
  // fontFamily: 'noto sans',
  fontFamily: "'MaShanZheng', 'STKaiti', Source Han Sans CN",
  fontSize: 20,
  fontWeight: "bold",
  // fill: ["#ffffff", "#00ff99"], // gradient
  fill: "white",
  // stroke: "#4a1850",
  // strokeThickness: 2,
  dropShadow: true,
});

const slimStyle = new PIXI.TextStyle({
  fontFamily: "'MaShanZheng', 'STKaiti', Source Han Sans CN",
  fontSize: 16,
  fill: "white",
  // lineHeight: 20,
  align: "center",
  // textBaseline: 'middle',
});
//anchor.set(0.5);

const fix = (style.fontSize - slimStyle.fontSize) / 2;

const BasicText = (props) => <Text style={style} {...props} />;
const SlimText = (props) => <Text style={slimStyle} {...props} />;

const count = 4;
const length = count - 1;

const point = {
  x: length / 2,
  y: length / 2,
};

function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

const Main = () => {
  const app = useRef();
  const [waiting, setWaiting] = useState(false);
  const { state } = useLocation();
  const [loading, setLoading] = useState(true);
  const isMobile = detectMob();

  const { $d, ymd, gender, general } = state;

  console.log($d);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 200);
  }, []);

  const xingNian = getXingNian(ymd, gender);
  const d = Lunar.fromDate($d);
  const timeZhi = d.getTimeZhi();
  // 时辰对应地支顺位
  const timeZhiKey = ZhiEnum[timeZhi];
  // 地盘与天盘的位差, 月将 - 时
  const gap = general - timeZhiKey;

  const dayGan = d.getDayGan();
  const dayZhi = d.getDayZhi();
  const dayXun = d.getDayXun();
  const xunData = Xuns.find((item) => {
    const [firstItem] = item;
    return firstItem === dayXun;
  });

  // 遁干
  const getDunGan = (zhi) => {
    const str = xunData.find((item) => item.includes(zhi)) || [];
    const [gan] = [...str];
    return gan;
  };

  // 天盘数
  const getTianPanKey = (key) => {
    if (gap > 0) {
      // 顺行
      return (key + gap) % 12 || 12;
    } else {
      // 逆行
      const $value = key + gap;
      return $value > 0 ? $value : 12 + $value;
    }
  };

  // 在卯、辰、巳、午、未、申之時位用陽貴，
  // 在酉、戌、亥、子、丑、寅之時位用陰貴，
  const isMorning = ["卯", "辰", "巳", "午", "未", "申"].includes(timeZhi);

  // 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎，此是贵神乡。
  const getNoble = () => {
    // 甲戊庚牛羊
    const 甲戊庚 = ["甲", "戊", "庚"];
    if (甲戊庚.includes(dayGan)) {
      return isMorning ? "丑" : "未";
    }
    // 乙己鼠猴乡
    const 乙己 = ["乙", "己"];
    if (乙己.includes(dayGan)) {
      return isMorning ? "子" : "申";
    }
    // 丙丁猪鸡位
    const 丙丁 = ["丙", "丁"];
    if (丙丁.includes(dayGan)) {
      return isMorning ? "亥" : "酉";
    }

    // 壬癸兔蛇藏
    const 壬癸 = ["壬", "癸"];
    if (壬癸.includes(dayGan)) {
      return isMorning ? "卯" : "巳";
    }

    // 六辛逢马虎
    const 六辛 = ["辛"];
    if (六辛.includes(dayGan)) {
      return isMorning ? "午" : "寅";
    }
  };

  const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const draw = React.useCallback((g) => {
    g.clear();
    g.lineStyle(2, 0xccccd6, 1);
    g.drawRoundedRect(0, 0, 80, 32, 0);
    g.endFill();
  }, []);

  function takeScreenshot() {
    setWaiting(true);

    app.current.renderer.extract.canvas(app.current.stage).toBlob((blob) => {
      saveAs(
        blob,
        `ren.o3o.tech-screenshot-${moment(now).format("MMM d, yyyy")}.png`
      );
      setWaiting(false);
    }, "image/png");
  }

  const Size = ({ children }) => {
    const [size, setSize] = useState(getSize);
    useEffect(() => {
      const update = () => setSize(getSize());
      window.onresize = update;
      return () => (window.onresize = null);
    }, []);
    return children(size);
  };

  const [target] = useState({
    x: length - 1,
    y: length,
  });

  const viewX = target.x - point.x;
  const viewY = point.y - target.y;

  const degree = Math.atan2(viewY, viewX);

  const dataSource = [];
  // Create a 4x4 grid
  for (let i = 0; i < count * count; i++) {
    const x = i % count;
    const y = Math.floor(i / count);
    const whiteList = [0, length];
    if (whiteList.includes(x) || whiteList.includes(y)) {
      const viewX = x - point.x;
      const viewY = point.y - y;
      const degree = Math.atan2(viewY, viewX);
      dataSource.push({
        x,
        y,
        degree,
      });
    }
  }

  const mainData = [];
  // Create a 4x2 grid
  for (let i = 0; i < 4 * 4; i++) {
    const x = i % 4;
    const y = Math.floor(i / 4);
    if (y < 2) {
      mainData.push({
        x,
        y: y + 1,
      });
    }
  }

  const data = dataSource
    .sort((pre, next) => {
      const { degree: preDegree } = pre;
      const { degree: nextDegree } = next;
      return (
        nextDegree -
        preDegree +
        (nextDegree > degree ? -2 * Math.PI : 0) +
        (preDegree > degree ? 2 * Math.PI : 0)
      );
    })
    .map((item, i) => {
      const key = i + 1;
      return {
        diPan: ZhiEnum[key],
        tianPan: ZhiEnum[getTianPanKey(key)],
        ...item,
      };
    });

  const findTianPan = (diPan) => {
    const { tianPan } = data.find((item) => item.diPan === diPan) || {};
    return tianPan;
  };

  const findDiPan = (tianPan) => {
    const { diPan } = data.find((item) => item.tianPan === tianPan) || {};
    return diPan;
  };

  const $dayZhi = findTianPan(dayZhi);
  const $$dayZhi = findTianPan($dayZhi);

  const $dayGan = findTianPan(QiGongEnum[dayGan]);
  const $$dayGan = findTianPan($dayGan);

  const 四课 = [
    [
      {
        text: $dayGan,
        // key: 0,
        key: 3,
      },
      {
        text: dayGan,
        // key: 4,
        key: 7,
      },
    ],
    [
      {
        text: $$dayGan,
        // key: 1,
        key: 2,
      },
      {
        text: $dayGan,
        // key: 5,
        key: 6,
      },
    ],
    [
      {
        text: $dayZhi,
        // key: 2,
        key: 1,
      },
      {
        text: dayZhi,
        // key: 6,
        key: 5,
      },
    ],
    [
      {
        text: $$dayZhi,
        // key: 3,
        key: 0,
      },
      {
        text: $dayZhi,
        // key: 7,
        key: 4,
      },
    ],
  ];

  const 四课数据 = 四课.flat();

  const noble = getNoble();

  // console.log("日干:", dayGan);

  // 从戍至巳逆行，以辰到亥顺就
  const isPositive = ["亥", "子", "丑", "寅", "卯", "辰"].includes(
    findDiPan(noble)
  );

  // console.log(isPositive ? "顺" : "逆");
  const nobleKey = ZhiEnum[noble];

  const nobleData = dataSource.map((data, i) => {
    const { x, y } = data;
    const gap = getTianPanKey(i + 1) - nobleKey;
    const key = (gap >= 0 ? gap : 12 + gap) + 1;
    const text = isPositive ? NobleEnum[key] : NobleXEnum[key];
    // 左
    if (x === 0) {
      return {
        x: -1,
        y,
        text,
      };
    }
    // 右
    if (x === length) {
      return {
        x: length + 1,
        y,
        text,
      };
    }
    // 上
    if (y === 0) {
      return {
        x,
        y: -1,
        text,
      };
    }
    // 下
    if (y === length) {
      return {
        x,
        y: length + 1,
        text,
      };
    }
    return {
      x,
      y,
      text,
    };
  });

  const findGeneral = (tianPanText) => {
    const index = data.findIndex(({ tianPan }) => {
      return tianPan === tianPanText;
    });
    if (index > -1) {
      const { text } = nobleData[index];
      return text;
    } else {
      console.error("findGeneral", tianPanText);
      return;
    }
  };

  function findRef(letter) {
    const { id } = Stem.get(dayGan).element.to(Branch.get(letter).element);
    return RefEnum[id];
  }

  function getThree() {
    const dayGanzhi = d.getDayInGanZhi();
    const { refer = [] } =
      jsonData.find(({ row_id, col_id }) => {
        return row_id === dayGanzhi && col_id === $dayGan;
      }) || {};
    return [...refer];
  }

  const threeLetter = getThree();

  const threeData = threeLetter.map((item) => ({
    key: item,
    gan: getDunGan(item),
    general: findGeneral(item),
    ref: findRef(item),
  }));

  const prev = d.getPrevJieQi();
// console.log('上一节气 = ' + prev.getName() + ' ' +prev.getSolar().toYmdHms());
const next = d.getNextJieQi();
// console.log('下一节气 = ' + next.getName() + ' ' +next.getSolar().toYmdHms());

  return (
    <>
      <Nav />
      <Stage
        {...getSize()}
        options={{
          // backgroundColor: 0x0f1423,
          backgroundColor: 0x1a1c2a,
          // backgroundColor: 0x1099bb,
          resolution: window.devicePixelRatio || 1,
          // resizeTo: window,
          // transparent: true,
          autoDensity: true,
        }}
        onMount={(_app) => (app.current = _app)}
      >
        <Size>
          {({ width }) => (
            <>
              <Container position={[width / 2 - 20 * 2, 20 + 60]}>
                {data.map(({ x, y, tianPan }, i) => {
                  const width = 20;
                  return (
                    <BasicText
                      x={x * width}
                      y={y * width}
                      text={tianPan}
                      key={i}
                    />
                  );
                })}
                {nobleData.map(({ x, y, text }, i) => {
                  const width = 20;
                  return (
                    <SlimText
                      x={fix + x * width}
                      y={fix + y * width}
                      text={NobleSlim[text]}
                      key={i}
                    />
                  );
                })}
              </Container>
              <Container position={[width / 2 - 20 * 2, 20 * 6 + 20 + 60]}>
                {四课.reverse().map((item, i) => {
                  const [upItem] = item;
                  const { text } = upItem;
                  const general = findGeneral(text);
                  return (
                    <SlimText
                      x={fix + i * 20}
                      y={0}
                      text={NobleSlim[general]}
                      key={i}
                    />
                  );
                })}
                {mainData.map(({ x, y }, i) => {
                  const width = 20;
                  const { text } = 四课数据.find(({ key }) => key === i);
                  return (
                    <BasicText
                      x={x * width}
                      y={y * width}
                      text={text}
                      key={i}
                    />
                  );
                })}
              </Container>
              <Container position={[width / 2 - 20 * 2, 20 * 11 + 60]}>
                {threeData.map(({ key, ref, general, gan }, i) => {
                  return (
                    <React.Fragment key={i}>
                      <SlimText x={fix} y={fix + i * 20} text={ref} />                 
                      <SlimText x={fix + 20} y={fix + i * 20} text={gan} />            
                      <BasicText x={2 * 20} y={i * 20} text={key} />
                      <SlimText
                        x={fix + 3 * 20}
                        y={fix + i * 20}
                        text={NobleSlim[general]}
                      />
                    </React.Fragment>
                  );
                })}
              </Container>
              <Container position={[width / 2 - 20 * 2, 20 * 15 + 60]}>
                {gender === 1 && (
                  <Sprite
                    x={-60}
                    y={0}
                    scale={{ x: 0.5, y: 0.5 }}
                    anchor={[0.5, 0]}
                    image={ImgMale}
                  />
                )}
                {gender === 0 && (
                  <Sprite
                    x={-60}
                    y={0}
                    scale={{ x: 0.5, y: 0.5 }}
                    anchor={[0.5, 0]}
                    image={ImgFemale}
                  />
                )}
                <SlimText
                  x={0}
                  y={0}
                  anchor={[0, 0]}
                  text={`公历: ${moment($d).format(
                    "YYYY-MM-DD HH:mm"
                  )} 星期${Solar.fromDate($d).getWeekInChinese()}`}
                />
                <SlimText
                  x={0}
                  y={22}
                  anchor={[0, 0]}
                  text={`农历: ${d.toString()}`}
                />
                <SlimText
                  x={0}
                  y={44}
                  anchor={[0, 0]}
                  text={`节气: ${prev.getName()} ${moment(prev.getSolar().toYmdHms()).format("MM-DD")} ${next.getName()} ${moment(next.getSolar().toYmdHms()).format("MM-DD")}`}
                />
                <SlimText
                  x={0}
                  y={66}
                  anchor={[0, 0]}
                  text={`四柱: ${d.getYearInGanZhi()} ${d.getMonthInGanZhi()} ${d.getDayInGanZhi()} ${d.getTimeInGanZhi()}`}
                />
                <SlimText
                  x={0}
                  y={88}
                  anchor={[0, 0]}
                  text={`旬空: ${d.getDayXun()}旬 ${d.getDayXunKong()}空`}
                />
                <SlimText
                  x={-96}
                  y={66}
                  anchor={[0, 0]}
                  text={`本命: ${getNianMing(ymd)}`}
                />
                <SlimText
                  x={-96}
                  y={88}
                  anchor={[0, 0]}
                  text={`行年: ${xingNian}`}
                />
              </Container>
              {!isMobile && (
                <Container
                  position={[
                    width / 2 - 20 * 2,
                    20 * 11 + 20 * 2 + 132 + 20 * 2 + 60,
                  ]}
                >
                  {!waiting && (
                    <Graphics draw={draw}>
                      <SlimText
                        x={40}
                        y={16}
                        anchor={[0.5, 0.5]}
                        text={`保存`}
                        pointerdown={takeScreenshot}
                        interactive
                      />
                    </Graphics>
                  )}
                  {waiting && <SlimText x={0} y={0} anchor={[0, 0]} text="" />}
                </Container>
              )}
            </>
          )}
        </Size>
      </Stage>
      <Loading global show={loading} />
    </>
  );
};

const Wrapper = ({ children }) => {
  const { state } = useLocation();
  const history = useHistory();
  if (!state) {
    history.push("/");
    return null;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Wrapper>
      <Main />
    </Wrapper>
  );
};

export default App;
