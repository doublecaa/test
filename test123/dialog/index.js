import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, AppState, DeviceEventEmitter } from 'react-native';
const PropTypes = require('prop-types');
import ProgressBar from './ProgressBar';
import update from './images/update.png';
import CodePush from "react-native-code-push";
const { height, width } = Dimensions.get('window');
let SWidth, SHeight;

if (height > width) {
    SWidth = width;
    SHeight = height;
} else {
    SWidth = height;
    SHeight = width;
}

export const ImmediateCheckCodePush = () => {
    DeviceEventEmitter.emit('ImmediateCheckCodePush');
};

class HotUpdate extends Component {

    constructor(props) {
        super(props);
        this.listener;
        this.currProgress = 0.0;
        this.syncMessage = '';
        this.state = {
            showUpdate: false,
            isSync: false,
            update: false,
            syncStatus: '',
            isMandatory: false,
            next: false,
            currProgress: 0.0,
            updateInfo: {}
        }
    }

    static propTypes = {
        deploymentKey: PropTypes.string,
        isActiveCheck: PropTypes.bool,
    };

    static defaultProps = {
        isActiveCheck: true,
    };


    componentWillMount() {
        CodePush.disallowRestart();
    }

    componentDidMount() {
        CodePush.allowRestart();
        if (this.props.isActiveCheck) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }
        this._handleAppStateChange('active');

        this.listener = DeviceEventEmitter.addListener('ImmediateCheckCodePush', (e) => {
            this.setState({ next: false }, () => {
                this._handleAppStateChange('active');
            });
        });
    }

    componentWillUnmount() {
        if (this.props.isActiveCheck) {
            AppState.removeEventListener('change')
        }
        this.listener && this.listener.remove();
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            this.syncImmediate();
        }
    };


    syncImmediate() {
        if (!this.state.next) {
            CodePush.checkForUpdate(this.props.deploymentKey).then((update) => {
                if (update) {
                    this.setState({ showUpdate: true, updateInfo: update, isMandatory: update.isMandatory });
                    console . log ( "???? c?? b???n c???p nh???t! Ch??ng ta c?? n??n t???i xu???ng kh??ng?" )
                }
                else{
                    console . log ( "???ng d???ng ???? ???????c c???p nh???t!" ) ;
                }
            })
        }
    }

    _immediateUpdate() {
        if (!this.state.isSync) {
            this.setState({ isSync: true }, () => {
                let codePushOptions = {
                    installMode: CodePush.InstallMode.ON_NEXT_RESTART,
                    mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
                };
                if (this.props.deploymentKey) {
                    codePushOptions.deploymentKey = this.props.deploymentKey;
                }
                CodePush.sync(
                    codePushOptions,
                    this.codePushStatusDidChange.bind(this),
                    this.codePushDownloadDidProgress.bind(this)
                );
            });
        }
    }

    codePushStatusDidChange(syncStatus) {
        let syncMessage = this.state.syncMessage;
        switch (syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.syncMessage = 'Checking for update';
                syncMessage = 'Ki???m tra b???n c???p nh???t...';
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.syncMessage = 'Downloading package';
                syncMessage = 'T???i xu???ng g??i c???p nh???t...';
                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                this.syncMessage = 'Awaiting user action';
                syncMessage = '??ang ch??? l???a ch???n';
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.syncMessage = 'Installing update';
                syncMessage = '??ang c??i ?????t b???n c???p nh???t';
                break;
            case CodePush.SyncStatus.UP_TO_DATE:
                this.syncMessage = 'App up to date.';
                syncMessage = 'Ho??n th??nh c???p nh???t';
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
                this.syncMessage = 'Update cancelled by user';
                syncMessage = 'H???y c???p nh???t';
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.syncMessage = 'Update installed and will be applied on restart.';
                syncMessage = 'C??i ?????t th??nh c??ng, ch??? kh???i ?????ng l???i!';
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.syncMessage = 'An unknown error occurred';
                syncMessage = 'L???i c???p nh???t, vui l??ng kh???i ?????ng l???i ???ng d???ng!';
                this.setState({ showUpdate: false });
                break;
        }
        console.log(syncMessage);
    }

    codePushDownloadDidProgress(progress) {
        if (this.state.isSync) {
            let temp = parseFloat(progress.receivedBytes / progress.totalBytes).toFixed(2);
            this.setState({ currProgress: temp }, () => {
                this.currProgress = temp;
                if (temp >= 1) {
                    if (!this.state.isMandatory) {
                        this.setState({ update: true });
                    } else {
                        this.setState({ showUpdate: false });
                    }
                } else {
                    this.refs.progressBar.progress = temp;
                    this.refs.progressBar.buffer = temp > 0.2 ? temp - 0.1 : 0;
                }
            });
        }
    }

    render() {
        return (<Modal visible={this.state.showUpdate} transparent={true}>
            <View style={styles.container}>
                {/* <Text>{CodePush.getConfiguration()}</Text>
                <Text>{CodePush.getUpdateMetadata()}</Text> */}
                <View style={[{ width: 0.8 * SWidth, marginBottom: 5 }]}>
                    <Image source={update} style={{ width: 0.8 * SWidth, height: 0.348 * SWidth }} />
                    <View style={{ backgroundColor: '#fff', width: 0.8 * SWidth, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, alignItems: 'center' }}>
                        <Text style={{ color: '#2979FF', fontSize: 20, fontWeight: 'bold', justifyContent: 'center' }}>T??m th???y phi??n b???n m???i</Text>
                        <View style={[{ width: 0.8 * SWidth - 40, minHeight: 120 }]}>
                            <Text style={{ color: '#000', fontSize: 17, marginTop: 10 }}></Text>
                            <Text style={{ color: '#999', fontSize: 14, marginTop: 10, lineHeight: 24, width: 0.8 * SWidth - 40 }} >
                                {this.state.updateInfo.description}
                            </Text>
                        </View>
                        <View style={{ marginBottom: 85 }} />
                        <View style={{
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: '#eee',
                            height: 80, width: 0.8 * SWidth,
                            position: 'absolute', bottom: 0,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            {this.state.update ? <TouchableOpacity onPress={() => {
                                this.setState({ showUpdate: false }, () => {
                                    CodePush.restartApp(true);
                                })
                            }} style={{ height: 40, width: 0.5 * SWidth }}>
                                <View style={{ height: 40, width: 0.5 * SWidth, flex: 1, alignItems: 'center', borderRadius: 20, justifyContent: 'center', backgroundColor: '#2979FF', }}>
                                    <Text style={{ color: '#fff', }}>C??i ?????t b???n c???p nh???t ngay b??y gi???</Text>
                                </View>
                            </TouchableOpacity> : (this.state.isSync ? <View style={{ height: 60, width: 0.8 * SWidth - 40, alignItems: 'center', justifyContent: 'center' }}>
                                <ProgressBar ref="progressBar" currProgress={`${Math.ceil(this.state.currProgress * 100)}%`} />
                                <Text style={{ marginTop: 10, color: '#333' }}>T???i g??i c???p nh???t</Text>
                            </View> : <View style={{
                                justifyContent: 'center', height: 60, width: 0.8 * SWidth,
                                alignItems: 'center',
                                flexDirection: 'row',
                            }}>
                                {this.state.isMandatory ? null : <TouchableOpacity onPress={() => {
                                    this.setState({ showUpdate: false, next: true });
                                }} style={{ height: 40, maxWidth: 0.5 * SWidth, marginHorizontal: 10, flex: 1 }}>
                                    <View style={{ height: 40, maxWidth: 0.5 * SWidth, alignItems: 'center', borderRadius: 20, justifyContent: 'center', backgroundColor: '#eee', flex: 1 }}>
                                        <Text style={{ color: '#666', }}>????? sau</Text>
                                    </View>
                                </TouchableOpacity>}
                                <TouchableOpacity onPress={() => {
                                    this._immediateUpdate();
                                }} style={{ height: 40, maxWidth: 0.5 * SWidth, marginHorizontal: 10, flex: 1 }}>
                                    <View style={{ height: 40, maxWidth: 0.5 * SWidth, alignItems: 'center', borderRadius: 20, justifyContent: 'center', backgroundColor: '#2979FF', flex: 1 }}>
                                        <Text style={{ color: '#fff', }}>{this.state.isMandatory ? 'C???p nh???t' : 'T???i xu???ng'}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>)}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>)
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        height: SHeight,
        width: SWidth,
    }
});

const codePushOptions = {
    checkFrequency: CodePush.CheckFrequency.MANUAL,
    // updateDialog: null,
};
export default CodePush(codePushOptions)(HotUpdate);
