/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { default as mockStore } from "../__mocks__/store.js"
import { ROUTES } from '../constants/routes.js'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted and should render NewBillPage", () => {
     
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld"
      }))
     
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const mailIcon = screen.getByTestId('icon-mail')

      expect(mailIcon).toHaveClass('active-icon');
      expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
})

describe("Given I am connected on NewBill Page", () => {
  describe("When I upload a not managed file", () => {
    test("Then it must launch alert message", () => {

      Object.defineProperty(window, 'alert', { value: jest.fn() })

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({ document, onNavigate: null, store: mockStore, localStorage: window.localStorage });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputChooseFile = screen.getByTestId('file');
      inputChooseFile.addEventListener('change', handleChangeFile);

      // files contient 2 fichiers
      const files = [
        new File(["texte"], "mauvaisFormat.txt", { type: "text/plain" }),
        new File(["image"], "bonFormat.jpeg", { type: "image/jpeg" })
      ];
      files.forEach((el) => {
      userEvent.upload(inputChooseFile, el)
      })
     
      expect(handleChangeFile).toHaveBeenCalledTimes(2);
      expect(alert).toHaveBeenCalledTimes(2);
    
    })
  })
})   