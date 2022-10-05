"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveImage = exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _canvas = require("canvas");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultOptions = Object.freeze({
  cellWidth: 100,
  cellHeight: 40,
  offsetLeft: 8,
  offsetTop: 26,
  spacing: 20,
  titleSpacing: 10,
  fontFamily: 'sans-serif',
  paddingVertical: 0,
  paddingHorizontal: 0,
  backgroundColor: '#ffffff'
});

const TableRenderer = (options = {}) => {
  const {
    cellWidth,
    cellHeight,
    offsetLeft,
    offsetTop,
    spacing,
    titleSpacing,
    fontFamily,
    paddingHorizontal,
    paddingVertical,
    backgroundColor
  } = { ...defaultOptions,
    ...options
  };

  const getTableWidth = columns => {
    var _columns$reduce;

    return (_columns$reduce = columns === null || columns === void 0 ? void 0 : columns.reduce((sum, col) => {
      var _col$width;

      return sum + (col === '|' ? 1 : (_col$width = col.width) !== null && _col$width !== void 0 ? _col$width : cellWidth);
    }, 0)) !== null && _columns$reduce !== void 0 ? _columns$reduce : cellWidth;
  };

  const getTableHeight = (title, columns, dataSource) => {
    var _dataSource$reduce;

    const titleHeight = title ? cellHeight + titleSpacing : 0;
    const headerHeight = !(columns === null || columns === void 0 ? void 0 : columns.length) || columns.every(col => !col.title) ? 0 : cellHeight;
    const bodyHeight = (_dataSource$reduce = dataSource === null || dataSource === void 0 ? void 0 : dataSource.reduce((height, row) => height + (row === '-' ? 1 : cellHeight), 0)) !== null && _dataSource$reduce !== void 0 ? _dataSource$reduce : 0;
    return titleHeight + headerHeight + bodyHeight;
  };

  const renderBackground = (ctx, width, height) => {
    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = backgroundColor;
    ctx.fillRect(-10, -10, width + 10, height + 10);
  };

  const renderHorizontalLines = ctx => (dataSource, {
    x,
    y,
    width
  }) => {
    ctx.strokeStyle = '#000000';
    dataSource === null || dataSource === void 0 ? void 0 : dataSource.forEach((row, i) => {
      if (row !== '-') return;
      ctx.moveTo(paddingHorizontal, y[i]);
      ctx.lineTo(paddingHorizontal + width, y[i]);
      ctx.stroke();
    });
  };

  const renderVerticalLines = ctx => (title, columns, {
    x,
    y,
    height
  }) => {
    ctx.strokeStyle = '#000000';
    const titleHeight = title ? cellHeight + titleSpacing : 0;
    const headerHeight = !(columns === null || columns === void 0 ? void 0 : columns.length) || columns.every(col => !col.title) ? 0 : cellHeight;
    columns === null || columns === void 0 ? void 0 : columns.forEach((col, i) => {
      if (col !== '|') return;
      ctx.moveTo(x[i], y[0] - headerHeight);
      ctx.lineTo(x[i], y[0] - headerHeight + height - titleHeight);
      ctx.stroke();
    });
  };

  const renderTitle = ctx => (title, titleStyle = {}, {
    top,
    x
  }) => {
    var _titleStyle$font, _titleStyle$fillStyle, _titleStyle$textAlign, _titleStyle$offsetTop;

    if (!title) return;
    ctx.font = (_titleStyle$font = titleStyle.font) !== null && _titleStyle$font !== void 0 ? _titleStyle$font : `bold 24px ${fontFamily}`;
    ctx.fillStyle = (_titleStyle$fillStyle = titleStyle === null || titleStyle === void 0 ? void 0 : titleStyle.fillStyle) !== null && _titleStyle$fillStyle !== void 0 ? _titleStyle$fillStyle : '#000000';
    ctx.textAlign = (_titleStyle$textAlign = titleStyle === null || titleStyle === void 0 ? void 0 : titleStyle.textAlign) !== null && _titleStyle$textAlign !== void 0 ? _titleStyle$textAlign : 'left';
    ctx.fillText(title, paddingHorizontal + offsetLeft, top + offsetTop + ((_titleStyle$offsetTop = titleStyle === null || titleStyle === void 0 ? void 0 : titleStyle.offsetTop) !== null && _titleStyle$offsetTop !== void 0 ? _titleStyle$offsetTop : 0));
  };

  const renderHeader = ctx => (columns, {
    x,
    y
  }) => {
    ctx.font = `normal 16px ${fontFamily}`;
    ctx.fillStyle = '#333333';
    columns === null || columns === void 0 ? void 0 : columns.forEach((col, i) => {
      if (typeof col != 'object' || !col.title) return;
      const {
        title,
        width = cellWidth,
        align = 'left'
      } = col;
      ctx.textAlign = align;
      ctx.fillText(title, x[i] + (align === 'right' ? width - offsetLeft : offsetLeft), y[0] - cellHeight + offsetTop);
    });
  };

  const renderRows = ctx => (columns, dataSource, {
    x,
    y
  }) => {
    dataSource === null || dataSource === void 0 ? void 0 : dataSource.forEach((row, i) => {
      if (row === '-') return;
      columns === null || columns === void 0 ? void 0 : columns.forEach(({
        width = cellWidth,
        dataIndex,
        align = 'left',
        prefix = '',
        suffix = ''
      }, j) => {
        if (!row[dataIndex]) return;
        const content = prefix + row[dataIndex] + suffix;
        ctx.textAlign = align;
        ctx.fillText(content, x[j] + (align === 'right' ? width - offsetLeft : offsetLeft), y[i] + offsetTop, width - 2 * offsetLeft);
      });
    });
  };

  const renderTable = ({
    title,
    titleStyle = {},
    columns,
    dataSource
  }, {
    ctx,
    width,
    height,
    top = paddingVertical
  }) => {
    var _columns$length, _dataSource$length;

    const info = {
      width,
      height,
      top,
      x: new Array((_columns$length = columns === null || columns === void 0 ? void 0 : columns.length) !== null && _columns$length !== void 0 ? _columns$length : 0).fill().map((_, i) => paddingHorizontal + (columns === null || columns === void 0 ? void 0 : columns.reduce((x, col, j) => {
        var _col$width2;

        return x + (j >= i ? 0 : col === '|' ? 1 : (_col$width2 = col.width) !== null && _col$width2 !== void 0 ? _col$width2 : cellWidth);
      }, 0))),
      y: new Array((_dataSource$length = dataSource === null || dataSource === void 0 ? void 0 : dataSource.length) !== null && _dataSource$length !== void 0 ? _dataSource$length : 0).fill().map((_, i) => {
        const titleHeight = title ? cellHeight + titleSpacing : 0;
        const headerHeight = !(columns === null || columns === void 0 ? void 0 : columns.length) || columns.every(col => !col.title) ? 0 : cellHeight;
        return top + titleHeight + headerHeight + (dataSource === null || dataSource === void 0 ? void 0 : dataSource.reduce((y, row, j) => y + (j >= i ? 0 : row === '-' ? 1 : cellHeight), 0));
      })
    };
    renderHorizontalLines(ctx)(dataSource, info);
    renderVerticalLines(ctx)(title, columns, info);
    renderTitle(ctx)(title, titleStyle, info);
    renderHeader(ctx)(columns, info);
    renderRows(ctx)(columns, dataSource, info);
  };

  const renderTables = (tables, {
    ctx,
    width,
    height
  }) => {
    tables.forEach((table, i) => {
      const {
        title,
        columns,
        dataSource
      } = table;
      const top = tables.reduce((top, {
        title,
        columns,
        dataSource
      }, j) => top + (j >= i ? 0 : getTableHeight(title, columns, dataSource)), 0) + i * spacing + paddingVertical;
      renderTable(table, {
        ctx,
        width: getTableWidth(columns),
        height: getTableHeight(title, columns, dataSource),
        top
      });
    });
  };

  const render = tables => {
    if (!Array.isArray(tables)) {
      const {
        title,
        columns,
        dataSource
      } = tables;
      const width = getTableWidth(columns);
      const height = getTableHeight(title, columns, dataSource);
      const canvas = (0, _canvas.createCanvas)(width + 2 * paddingHorizontal, height + 2 * paddingVertical);
      const ctx = canvas.getContext('2d');
      renderBackground(ctx, width + 2 * paddingHorizontal, height + 2 * paddingVertical);
      renderTable(tables, {
        ctx,
        width,
        height
      });
      return canvas;
    } else {
      const width = tables.reduce((maxWidth, {
        columns
      }) => Math.max(getTableWidth(columns), maxWidth), 0) + 2 * paddingHorizontal;
      const height = tables.reduce((height, {
        title,
        columns,
        dataSource
      }) => height + getTableHeight(title, columns, dataSource), 0) + (tables.length - 1) * spacing + 2 * paddingVertical;
      const canvas = (0, _canvas.createCanvas)(width, height);
      const ctx = canvas.getContext('2d');
      renderBackground(ctx, width, height);
      renderTables(tables, {
        ctx,
        width,
        height
      });
      return canvas;
    }
  };

  return {
    render
  };
};

var _default = TableRenderer;
exports.default = _default;

const saveImage = async (canvas, filepath) => {
  await new Promise((resolve, reject) => {
    const ws = _fs.default.createWriteStream(filepath);

    ws.on('finish', resolve);
    ws.on('error', reject);
    canvas.createPNGStream().pipe(ws);
  });
};

exports.saveImage = saveImage;