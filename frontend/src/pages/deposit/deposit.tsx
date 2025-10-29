import useDeposit from '../../_hooks/useDeposit'
import PaymentQRCode from '../../components/PaymentQRCode'
import './deposit.css'
import { toast } from 'react-toastify'

const Deposit = () => {
  const {
    register,
    handleSubmit,
    amount,
    handleChange,
    onSubmit,
    bankUpiLists,
    handleUploadedFile,
    preview,
    generateTransactionId,
    handleUploadedUTR
  } = useDeposit()
 const copytoclipboard = (code:string) => {
    const textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = "0";
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      toast.success("Copied succesfull")
    } catch (err) {
      console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);

  }
  return (
    <div className='mt-10'>
      <div className='card mb-10'>
        <div className='card-header'>
          <h4 className='mb-0'>Deposit</h4>
        </div>
        <div className='card-body'>
          <div className='deposit-page deposit'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='deposit-form' style={{ padding: '0px' }}>
                <div className='row row5 mt-2'>
                  <div className='col-md-3 col-12'>
                    <label className='w-100 label-amount'>Enter Amount:</label>
                    <div className='form-group mb-3 depo-amount'>
                      {/* <button className='deposit-minus'>
                      <i className='fas fa-minus' />
                    </button> */}
                      <input
                        type='number'
                        placeholder='Amount'
                        className='form-control'
                        {...register('amount')}
                        onChange={handleChange}
                      />
                      {/* <button className='deposit-plus'>
                      <i className='fas fa-plus' />
                    </button> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className='payment-ions-container'>
                <div className='payment-icons'>
                  <div className='glass' />
                  <div className='content'>
                    <div className='payment-icons-title'>
                      <h4 className='mb-0'>
                        <span>UPI Payment</span> <i className='fas fa-info-circle payment-rules' />
                      </h4>
                      <p>Make Sure You Attach Successful Payment Screenshot</p>
                    </div>
                    <div className='deposit-options'>
                      <div
                        className={`bank-detail ${amount && amount > 0 ? '' : 'payment-disable'}`}
                      >
                        <div className='payment-detail-box'>
                          <p>
                            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                            {bankUpiLists?.settings && bankUpiLists?.settings?.upiId}
                            <span className='ml-auto'><i className='fas fa-copy mr-1' onClick={() => { copytoclipboard(bankUpiLists?.settings?.upiId) }} /></span>
                          </p>
                        </div>
                        <div className='text-center qr-code'>
                          {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                          <PaymentQRCode upiId={bankUpiLists?.settings?.upiId} name={bankUpiLists?.settings?.upiName} amount={amount} transactionId={generateTransactionId()}/>
                          {/* <img src={bankUpiLists?.settings?.upiQrCode || ""} /> */}
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-12'  style={{padding:"7px"}}>
                      <input type="number" className='form-control' 
                      placeholder='Enter UTR No'
                      disabled={amount && amount > 0 ? false : true}
                      {...register('utrno')}
                      value={preview.type=='upi' ? preview.utrno : ""}
                      onChange={(e) => handleUploadedUTR(e, 'upi')}/>
                    </div>
                    <div className='p-2 w-100 d-flex align-items-center justify-content-between'>
                      <div className={`upload-ss ${amount && amount > 0 ? '' : 'pay-disable'}`}>
                        <input
                          type='file'
                          id='upload-14624'
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-expect-error
                          disabled={`${amount && amount > 0 ? '' : 'disabled'}`}
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-expect-error
                          hidden='hidden'
                          accept='image/png, image/jpg, image/jpeg'
                          {...register('imageUrl')}
                          onChange={(e) => handleUploadedFile(e, 'upi')}
                        />
                        <label htmlFor='upload-14624'>
                          <i className='fas fa-plus-circle mr-1' />
                          upload payment screenshot
                        </label>
                      </div>

                      <button
                        className={`payment-pay-now d-flex flex-wrap justify-content-center ${
                          preview?.imagePath && preview?.type == 'upi' ? '' : 'pay-disable'
                        }`}
                        type='submit'
                      >
                        <div className='w-100 text-center'>
                          <span>Pay Now</span>
                        </div>
                        <small>(Range: 100 - 100000)</small>
                      </button>
                    </div>
                  </div>
                </div>
                <div className='payment-icons'>
                  <div className='glass' />
                  <div className='content'>
                    <div className='payment-icons-title'>
                      <h4 className='mb-0'>
                        <span>Account Transfer</span>
                        <i className='fas fa-info-circle payment-rules' />
                      </h4>
                      <p>Make Sure You Attach Successful Payment Screenshot</p>
                    </div>
                    <div className='deposit-options'>
                      <div
                        className={`bank-detail ${amount != undefined ? '' : 'payment-disable'}`}
                      >
                        <div className='payment-detail-box'>
                          <p>
                            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                            {bankUpiLists?.settings && bankUpiLists?.settings?.accountHolderName}
                            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                            <i className='fas fa-copy mr-1' onClick={() => { copytoclipboard(bankUpiLists?.settings?.accountHolderName) }}/>
                         </p>
                        </div>
                        <div className='payment-detail-box'>
                          <p>
                            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                            {bankUpiLists?.settings && bankUpiLists?.settings?.accountNumber}                  
                            <i className='fas fa-copy mr-1' onClick={() => { copytoclipboard(bankUpiLists?.settings?.accountNumber) }} />
                          </p>
                        </div>
                        <div className='payment-detail-box'>
                          <p>
                            {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                           @ts-ignore */}
                            {bankUpiLists?.settings && bankUpiLists?.settings?.ifscCode}
                            <i className='fas fa-copy mr-1' onClick={() => { copytoclipboard(bankUpiLists?.settings?.ifscCode) }} />
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className='col-lg-12' style={{padding:"7px"}}>
                      <input type="number" className='form-control' 
                      placeholder='Enter UTR No'
                      {...register('utrno')}
                      value={preview.type=='bank' ? preview.utrno : ""}
                      disabled={amount && amount > 0 ? false : true}
                      onChange={(e) => handleUploadedUTR(e, 'bank')}/>
                    </div>
                    <div className='p-2 w-100 d-flex align-items-center justify-content-between'>
                  
                      <div className={`upload-ss ${amount != undefined ? '' : 'pay-disable'}`}>
                        <input
                          type='file'
                          id='upload-14623'
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-expect-error
                          disabled={`${amount != undefined ? '' : 'disabled'}`}
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          //@ts-expect-error
                          hidden='hidden'
                          accept='image/png, image/jpg, image/jpeg'
                          {...register('imageUrl')}
                          onChange={(e) => handleUploadedFile(e, 'bank')}
                        />
                        <label htmlFor='upload-14623'>
                          <i className='fas fa-plus-circle mr-1' />
                          upload payment screenshot
                        </label>
                      </div>

                      <button
                        className={`payment-pay-now d-flex flex-wrap justify-content-center ${
                          preview?.imagePath && preview?.type == 'bank' ? '' : 'pay-disable'
                        }`}
                        type='submit'
                      >
                        <div className='w-100 text-center'>
                          <span>Pay Now</span>
                        </div>
                        <small>(Range: 100 - 100000)</small>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Deposit
