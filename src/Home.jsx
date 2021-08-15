import React, { useState } from "react";
import { DatePicker, Picker, List } from "antd-mobile";
import { Lunar } from "lunar-javascript";
import moment from "moment";
import { Card, Icon, Button } from "zhui";
import { SxEnum } from "./invariant";
import { useHistory } from "react-router-dom";

const nowTimeStamp = Date.now();
const now = new Date(nowTimeStamp);

const d = Lunar.fromDate(now);

const years = [];

for (let i = 1970; i <= now.getFullYear(); i++) {
  const newYear = Lunar.fromYmd(i, 1, 1);
  const realNewYear = newYear.getJieQiTable()["立春"];

  const curYear = realNewYear.next(1);
  const prevYear = realNewYear.next(-1);

  const $curYear = curYear.getLunar();
  const $prevYear = prevYear.getLunar();

  const curGanZhi = $curYear.getYearInGanZhiByLiChun();
  const [, curZhi] = [...curGanZhi];
  const curSx = SxEnum[curZhi];

  const prevGanZhi = $prevYear.getYearInGanZhiByLiChun();
  const [, prevZhi] = [...prevGanZhi];
  const prevSx = SxEnum[prevZhi];

  const isAfter = moment(now).isAfter(moment(realNewYear.toYmd()));

  const children = isAfter
    ? [
        {
          label: ` ${curGanZhi} - ${curSx}`,
          value: curYear.toYmd(),
        },
        {
          label: ` ${prevGanZhi} - ${prevSx}`,
          value: prevYear.toYmd(),
        },
      ]
    : [
        {
          label: ` ${prevGanZhi} - ${prevSx}`,
          value: prevYear.toYmd(),
        },
      ];

  years.push({
    label: i,
    value: i,
    children,
  });
}

const { children } = years.find(({ value }) => {
  return value === now.getFullYear();
});

const isAfter = moment(now).isAfter(moment(d.getJieQiTable()["立春"].toYmd()));
const defaultYearInfo =
  isAfter || children.length === 1 ? children[0].value : children[1].value;
const defaultYear = [now.getFullYear(), defaultYearInfo];

const gender = [
  {
    value: 1,
    label: "男",
  },
  {
    value: 0,
    label: "女",
  },
];

const month = [
  {
    label: "子",
    value: 1,
  },
  {
    label: "丑",
    value: 2,
  },
  {
    label: "寅",
    value: 3,
  },
  {
    label: "卯",
    value: 4,
  },
  {
    label: "辰",
    value: 5,
  },
  {
    label: "巳",
    value: 6,
  },
  {
    label: "午",
    value: 7,
  },
  {
    label: "未",
    value: 8,
  },
  {
    label: "申",
    value: 9,
  },
  {
    label: "酉",
    value: 10,
  },
  {
    label: "戌",
    value: 11,
  },
  {
    label: "亥",
    value: 12,
  },
];

// 正月建寅 亥为月将
// 二月建卯 戌为月将
// 三月建辰 酉为月将
// 四月建巳 申为月将
// 五月建午 未为月将
// 六月建未 午为月将
// 七月建申 巳为月将
// 八月建酉 辰为月将
// 九月建戌 卯为月将
// 十月建亥 寅为月将
// 十一月建子 丑为月将
// 十二月建丑 子为月将
const getGeneral = (date) => {
  const d = Lunar.fromDate(date);
  const lunarMonth = Math.abs(d.getMonth());
  return [13 - lunarMonth];
};

const Home = () => {
  const [state, setState] = useState({
    date: now,
    time: now,
    general: getGeneral(now),
    year: defaultYear,
    gender: [1],
  });
  const history = useHistory();

  return (
    <div id="home">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card
          cornerLeft="趋吉"
          cornerRight="避凶"
          img={<Icon color="#fff" type="refresh" style={{ fontSize: 100 }} />}
          title="大六壬起课"
          underline
          width="100%"
          style={{ height: "100vh", maxWidth: "auto" }}
        >
          <p>先占不测之风云，泄元机藏之秘</p>
          <List className="date-picker-list">
            <Picker
              data={gender}
              value={state.gender}
              onChange={(gender) => {
                setState((state) => ({ ...state, gender }));
              }}
              cols={1}
            >
              <List.Item arrow="horizontal">性别</List.Item>
            </Picker>

            <Picker
              data={years}
              value={state.year}
              onChange={(year) => {
                setState((state) => ({ ...state, year }));
              }}
              cols={2}
            >
              <List.Item arrow="horizontal">生辰</List.Item>
            </Picker>
            <DatePicker
              mode="date"
              title="占日"
              value={state.date}
              onChange={(date) => {
                const general = getGeneral(date);
                setState((state) => ({ ...state, date, general }));
              }}
            >
              <List.Item arrow="horizontal">占日</List.Item>
            </DatePicker>
            <DatePicker
              mode="time"
              minuteStep={2}
              use12Hours
              value={state.time}
              onChange={(time) => {
                setState((state) => ({ ...state, time }));
              }}
            >
              <List.Item arrow="horizontal">占时</List.Item>
            </DatePicker>
            <Picker
              data={month}
              value={state.general}
              onChange={(general) => {
                setState((state) => ({ ...state, general }));
              }}
              cols={1}
            >
              <List.Item arrow="horizontal">月将</List.Item>
            </Picker>

            <List.Item className="submit-block">
              <Button
                theme="yuanshan"
                outline
                size="large"
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  const { date, time, gender, year, general } = state;
                  const $day = moment(date);
                  const $time = moment(time, "HH:mm");
                  const $d = $day.set({
                    hour: $time.get("hour"),
                    minute: $time.get("minute"),
                    second: $time.get("second"),
                  });
                  const [$general] = general;
                  const [$gender] = gender;
                  const [, ymd] = year;
                  history.push({
                    pathname: "/ace",
                    state: {
                      ymd: ymd,
                      gender: $gender,
                      $d: $d.toDate(),
                      general: $general,
                    },
                  });
                }}
              >
                起课
              </Button>
            </List.Item>
          </List>
        </Card>
      </div>
    </div>
  );
};
export default Home;
