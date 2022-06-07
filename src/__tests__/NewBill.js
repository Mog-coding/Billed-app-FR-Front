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
  describe("When I upload a not allowed file", () => {
    test("Then it must launch alert", () => {

      Object.defineProperty(window, 'alert', { value: jest.fn() })

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({ document, onNavigate: null, store: mockStore, localStorage: window.localStorage });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputChooseFile = screen.getByTestId('file');
      inputChooseFile.addEventListener('change', handleChangeFile);

      const fileNok = new File(["texte"], "mauvaisFormat.txt", { type: "text/plain" });
      userEvent.upload(inputChooseFile, fileNok)
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(alert).toHaveBeenCalledTimes(2);
    })
  })

  describe("When I upload an allowed file", () => {
    test("Then it must not launch alert", () => {

      Object.defineProperty(window, 'alert', { value: jest.fn() })

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill = new NewBill({ document, onNavigate: null, store: mockStore, localStorage: window.localStorage });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputChooseFile = screen.getByTestId('file');
      inputChooseFile.addEventListener('change', handleChangeFile);

      const fileOk = new File(["image"], "bonFormat.jpeg", { type: "image/jpeg" });

      userEvent.upload(inputChooseFile, fileOk)
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(alert).not.toHaveBeenCalled();
    })
  })

  describe("When I click on submit button", () => {
    test("Should launch handleSubmit method and navigate to Bills page", async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      // formulaire rempli correctement
      /*
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: "Transports" } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: "Vol Athen" } });
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: "2012-12-21" } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: 200 } });
      fireEvent.change(screen.getByTestId('vat'), { target: { value: 70 } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: 21 } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: 21 } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: "hi" } });
      */

      newBill.fileName = 'facture voyage'
      newBill.fileUrl = 'preview-facture-free-201801-pdf-1.jpg'
      newBill.mail = "employee@tld.test"

      // Appui submit   
      const submitButton = screen.getByTestId('submitButton');
      submitButton.addEventListener('submit', handleSubmit);
      userEvent.click(submitButton);

      // Chargement page Bills
      await waitFor(() => screen.getByTestId('btn-new-bill'));
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy();

    })
  })
})