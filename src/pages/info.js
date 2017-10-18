import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import get from "lodash.get";
import { connect } from "react-redux";
import { graphql } from "../lib/graphql";
import { bindActionCreators } from "redux";
import { store } from "../redux/info";
import { Table, Input, Form, Button, Modal, message } from "antd";
const FormItem = Form.Item;
class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      action: "createRow",
      rowId: "",
      columns: [
        {
          title: "key",
          dataIndex: "key",
          key: "key",
          width: "25%"
        },
        {
          title: "简体中文",
          dataIndex: "value_cn",
          key: "value_cn",
          width: "25%"
        },
        {
          title: "English",
          dataIndex: "value_en",
          key: "value_en",
          width: "25%"
        },
        {
          title: "繁体中文",
          dataIndex: "value_tw",
          key: "value_tw",
          width: "25%"
        },
        {
          title: "操作",
          dataIndex: "operation",
          render: (text, record) => (
            <div>
              <Button type="primary" onClick={() => this.updateRow(record)}>
                修改
              </Button>
              <Button type="danger">刪除</Button>
            </div>
          )
        }
      ]
    };
  }

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };
  handleAdd = () => {
    this.props.form.setFieldsValue({
      key: "",
      value_cn: "",
      value_en: "",
      value_tw: ""
    });
    this.setState({
      visible: true,
      action: "createRow"
    });
  };

  /**
   * 创建一条新数据
   * @param e
   */
  handleSubmit(e, action) {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          values.tid = this.props.match.params.id;
          values.id = this.state.rowId;
          const createRow = await graphql(`
          mutation ${action} {
            me {
              ${action}(argv: {id: "${values.id}", tid:"${values.tid}", key:"${values.key}", value_cn: "${values.value_cn}", value_en: "${values.value_en}", value_tw: "${values.value_tw}"}) {
                id
                uid
                tid
                key
                value_cn
                value_en
                value_tw
              }
            }
          }
        `)();
          message.info("操作成功");
          this.setState({
            visible: false
          });
          const data = await this.getAllRows()();

          this.props.storeInfo(get(data, ["me", "rows", "data"]));
        } catch (err) {
          console.error(err);
        }
      }
    });
  }
  async componentWillMount() {
    try {
      const data = await this.getAllRows()();
      this.props.storeInfo(get(data, ["me", "rows", "data"]));
    } catch (err) {}
  }

  /**
   * 更新某一条数据
   */
  updateRow(record) {
    this.setState({
      visible: true,
      action: "updateRow",
      rowId: record.id
    });
    this.props.form.setFieldsValue({
      key: record.key,
      value_cn: record.value_cn,
      value_en: record.value_en,
      value_tw: record.value_tw
    });
  }

  getAllRows() {
    const query = JSON.stringify({
      tid: this.props.match.params.id
    });
    return graphql(`
       query getRows{
          me{
            rows(query: {limit: 10, keyJson: ${JSON.stringify(query)}}){
              data{
                id
                tid
                uid
                key
                value_cn
                value_tw
                value_en
              }
            }
          }
       }
      `);
  }

  render() {
    const dataSource = this.props.INFO;
    const { columns, action } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Button type="primary" className="editable-add-btn" onClick={this.handleAdd}>
          添加
        </Button>
        <Table pagination={false} bordered dataSource={dataSource} columns={columns} />

        <Modal title="添加类型" footer={null} visible={this.state.visible}>
          <Form onSubmit={e => this.handleSubmit(e, action)} className="login-form">
            <FormItem label="key">
              {getFieldDecorator("key", {
                rules: [{ required: true, message: "请输入key!" }]
              })(<Input placeholder="key" />)}
            </FormItem>
            <FormItem label="简体中文">
              {getFieldDecorator("value_cn", {
                rules: [{ required: true, message: "请输入简体中文!" }]
              })(<Input placeholder="简体中文" />)}
            </FormItem>
            <FormItem label="English">
              {getFieldDecorator("value_en", {
                rules: [{ required: true, message: "请输入英文!" }]
              })(<Input placeholder="English" />)}
            </FormItem>
            <FormItem label="繁体中文">
              {getFieldDecorator("value_tw", {
                rules: [{ required: true, message: "请输入繁体中文!" }]
              })(<Input placeholder="繁体中文" />)}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="login-form-button">
                确定
              </Button>
              <Button onClick={this.handleCancel.bind(this)} className="login-form-button">
                取消
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
const connection = cmp => {
  return connect(
    function mapStateToProps(state) {
      return {
        INFO: state.INFO || []
      };
    },
    function mapDispatchToProps(dispatch) {
      return bindActionCreators(
        {
          storeInfo: store
        },
        dispatch
      );
    }
  )(cmp);
};
export default connection(withRouter(Form.create()(Info)));
