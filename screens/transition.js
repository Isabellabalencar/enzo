import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  Alert,
  ToastAndroid,
  KeyboardAvoidingView
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config";
import firebase from "firebase";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookName: "",
      studentName: ""
    };
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" é verdadeiro se o usuário concedeu permissão
          status === "granted" é falso se o usuário não concedeu permissão
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  handleTransaction = async () => {
    var { bookId, studentId } = this.state;
    await this.getBookDetails(bookId);
    await this.getStudentDetails(studentId);

    db.collection("books")
      .doc(bookId)
      .get()
      .then(doc => {
        var book = doc.data();
        if (book.is_book_available) {
          var { bookName, studentName } = this.state;
          this.initiateBookIssue(bookId, studentId, bookName, studentName);

          // Apenas para usuários do Android
          //ToastAndroid.show("Livro entregue para o aluno!", ToastAndroid.SHORT);

          Alert.alert("Book issued to the student!");
        } else {
          var { bookName, studentName } = this.state;
          this.initiateBookReturn(bookId, studentId, bookName, studentName);

          // Apenas para usuários do Android
         // ToastAndroid.show("Livro retornado à biblioteca!", ToastAndroid.SHORT);

          Alert.alert("Book returned to the library!");
        }
      });
  };

  getBookDetails = bookId => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().book_details.book_name
          });
        });
      });
  };

  getStudentDetails = studentId => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().student_details.student_name
          });
        });
      });
  };

  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    });
    //alterar status do livro
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: false
      });
    // alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1)
      });

    // atualizando estado local
    this.setState({
      bookId: "",
      studentId: ""
    });
  };

  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    // adicionar uma transação
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    });
    // alterar status do livro
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: true
      });
    // alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
      });

    // atualizando estado local
    this.setState({
      bookId: "",
      studentId: ""
    });
  };

  render() {
    const { bookId, studentId, domState, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styleSheet.container2}>
        <ImageBackground source={bgImage} style={styleSheet.bgi}>
          <View style={styleSheet.iconOrganization}>
            <Image source={appIcon} style={styleSheet.icon} />
            <Image source={appName} style={styleSheet.name} />
          </View>
          <View style={styleSheet.lowerContainer}>
            <View style={styleSheet.tStyle}>
              <TextInput
                style={styleSheet.textInput}
                placeholder={"ID do Livro"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText={text => this.setState({ bookId: text })}
              />
              <TouchableOpacity
                style={styleSheet.button}
                onPress={() => this.getCameraPermissions("bookId")}
              >
                <Text style={styleSheet.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styleSheet.tStyle, { marginTop: 25 }]}>
              <TextInput
                style={styleSheet.textInput}
                placeholder={"ID do Aluno"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText={text => this.setState({ studentId: text })}
              />
              <TouchableOpacity
                style={styleSheet.button}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styleSheet.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styleSheet.sendButton, { marginTop: 25 }]}
              onPress={this.handleTransaction}
            >
              <Text style={styleSheet.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styleSheet = StyleSheet.create({
  container2: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#5653D4",
  },
  text2: {
      color: "white"
  },
  button: {
      width: "43%",
      height: 55,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0072FF",
      borderRadius: 15
  },
  bgi: {
    resizeMode: "cover",
    flex: 1,
    justifyContent: "center",
  },
  icon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  name: {
    width: 80,
    height: 80,
    resizeMode: "contain"
  },
  iconOrganization: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  textInput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "blue",
    borderRadius: 10,
    fontSize: 18,
    backgroundColor: "purple",
    color: "white"
  },
  tStyle: {
    marginTop: 25,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "purple",
    borderColor: "blue"
  },
  lowerContainer: {
  flex: 0.5,
  alignItems: "center"
},
scanbuttonText: {
  fontSize: 20,
  color: "#0A0101",
  fontFamily: "Rajdhani_600SemiBold"
},
sendButton: {
  width: "43%",
  height: 55,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 15,
  marginTop: 25,
  backgroundColor: "purple",
  borderColor: "blue",
  borderWidth: 2
}
})